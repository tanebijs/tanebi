import { BotFriendMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';
import { getImageMetadata } from '@/internal/util/media/image';
import { rawMessage } from '@/message';
import { Bot, ctx, log } from '@/index';
import { PrivateMessage } from '@/internal/message/incoming';
import { randomInt } from 'crypto';
import { getGeneralMetadata } from '@/internal/util/media/common';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';

export class PrivateMessageBuilder extends AbstractMessageBuilder {
    repliedMessage?: BotFriendMessage;

    constructor(
        private readonly friendUin: number,
        private readonly friendUid: string,
        bot: Bot,
    ) {
        super(bot);
    }

    reply(message: BotFriendMessage) {
        this.repliedMessage = message;
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.bot[log].emit('debug', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.bot[ctx].ops.call(
            'uploadPrivateImage', 
            this.friendUid,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            compatFace: uploadResp.upload?.compatQMsg ? CustomFaceElement.decode(uploadResp.upload.compatQMsg) : undefined,
        });
    }

    override async record(data: Buffer, duration: number): Promise<void> {
        const recordMeta = getGeneralMetadata(data);
        this.bot[log].emit('debug', 'PrivateMessageBuilder', `Prepare to upload record ${JSON.stringify(recordMeta)}`);
        const uploadResp = await this.bot[ctx].ops.call(
            'uploadPrivateRecord',
            this.friendUid,
            recordMeta,
            duration,
        );
        await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
        this.segments.push({
            type: 'record',
            msgInfo: uploadResp.upload!.msgInfo!,
        });
    }

    override build(clientSequence: number): OutgoingPrivateMessage {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.friendUin,
            targetUid: this.friendUid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: this.segments,
            reply: this.repliedMessage ? {
                sequence: this.repliedMessage.sequence,
                senderUin: this.friendUin,
                senderUid: this.friendUid,
                messageUid: this.repliedMessage.messageUid,
                elements: this.repliedMessage[rawMessage].rawElems,
            } : undefined,
            repliedClientSequence: (<PrivateMessage | undefined>this.repliedMessage?.[rawMessage])?.clientSequence,
        };
    }
}