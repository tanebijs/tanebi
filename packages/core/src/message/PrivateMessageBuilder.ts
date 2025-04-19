import { BotFriendMessage } from '@/entity';
import { Bot, ctx, log } from '@/index';
import { MessageType } from '@/internal/message';
import { rawElems } from '@/internal/message/incoming';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import {
    OutgoingPrivateMessage,
    type OutgoingSegment,
    OutgoingSegmentOf,
    ReplyInfo,
} from '@/internal/message/outgoing';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { getGeneralMetadata } from '@/internal/util/media/common';
import { getImageMetadata } from '@/internal/util/media/image';
import { ForwardedMessagePacker, rawMessage } from '@/message';
import { randomInt } from 'crypto';
import { isPromise } from 'util/types';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';

export class PrivateMessageBuilder extends AbstractMessageBuilder {
    replyInfo?: ReplyInfo;
    repliedClientSequence?: number;

    constructor(protected readonly friendUin: number, protected readonly friendUid: string, bot: Bot) {
        super(bot);
    }

    reply(message: BotFriendMessage) {
        this.replyInfo = {
            sequence: message.sequence,
            senderUin: this.friendUin,
            senderUid: this.friendUid,
            messageUid: message.messageUid,
            elements: message[rawMessage][rawElems],
        };
        this.repliedClientSequence = message[rawMessage].clientSequence;
    }

    override image(data: Buffer, subType?: ImageSubType, summary?: string): this {
        this.segments.push((async () => {
            const imageMeta = getImageMetadata(data);
            this.bot[log].emit(
                'trace',
                'PrivateMessageBuilder',
                `Prepare to upload image ${JSON.stringify(imageMeta)}`,
            );
            const uploadResp = await this.bot[ctx].ops.call(
                'uploadPrivateImage',
                this.friendUid,
                imageMeta,
                subType ?? ImageSubType.Picture,
                summary,
            );
            await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatImage: uploadResp.upload?.compatQMsg?.length ?
                    NotOnlineImageElement.decode(uploadResp.upload.compatQMsg) :
                    undefined,
            };
        })());

        return this;
    }

    override record(data: Buffer, duration: number): this {
        this.segments.push((async () => {
            const recordMeta = getGeneralMetadata(data);
            this.bot[log].emit(
                'trace',
                'PrivateMessageBuilder',
                `Prepare to upload record ${JSON.stringify(recordMeta)}`,
            );
            const uploadResp = await this.bot[ctx].ops.call(
                'uploadPrivateRecord',
                this.friendUid,
                recordMeta,
                duration,
            );
            await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
            return {
                type: 'record',
                msgInfo: uploadResp.upload!.msgInfo!,
            };
        })());

        return this;
    }

    override async forward(
        packMsg: (p: ForwardedMessagePacker) => void | Promise<void>,
    ): Promise<OutgoingSegmentOf<'forward'>> {
        const packer = new ForwardedMessagePacker(this.bot);
        await packMsg(packer);
        const pack = await packer.pack();
        this.segments.push(pack);
        return pack;
    }

    override async build(clientSequence: number): Promise<OutgoingPrivateMessage> {
        for (let i = 0; i < this.segments.length; i++) {
            if (isPromise(this.segments[i])) this.segments[i] = await this.segments[i];
        }

        return {
            type: MessageType.PrivateMessage,
            targetUin: this.friendUin,
            targetUid: this.friendUid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: this.segments as OutgoingSegment[],
            reply: this.replyInfo,
            repliedClientSequence: this.repliedClientSequence,
        };
    }
}
