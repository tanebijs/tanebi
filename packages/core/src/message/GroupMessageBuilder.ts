import { BotGroupMember, BotGroupMessage } from '@/entity';
import { Bot, ctx, log } from '@/index';
import { MessageType } from '@/internal/message';
import { rawElems } from '@/internal/message/incoming';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingGroupMessage, type OutgoingSegment, OutgoingSegmentOf, ReplyInfo } from '@/internal/message/outgoing';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { getGeneralMetadata } from '@/internal/util/media/common';
import { getImageMetadata } from '@/internal/util/media/image';
import { ForwardedMessagePacker, rawMessage } from '@/message';
import { randomInt } from 'crypto';
import { isPromise } from 'util/types';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';

export class GroupMessageBuilder extends AbstractMessageBuilder {
    replyInfo?: ReplyInfo;

    constructor(private readonly groupUin: number, bot: Bot) {
        super(bot);
    }

    /**
     * Mention a member in the group
     * @param member The member to mention
     */
    mention(member: BotGroupMember) {
        this.segments.push({
            type: 'mention',
            uin: member.uin,
            uid: member.uid,
            name: '@' + (member.card || member.nickname),
        });

        return this;
    }

    /**
     * Mention all members in the group
     */
    mentionAll() {
        this.segments.push({
            type: 'mention',
            uin: 0,
            uid: '',
            name: '@全体成员',
        });

        return this;
    }

    /**
     * Reply to a group message
     */
    reply(message: BotGroupMessage) {
        if (message.sender.group.uin !== this.groupUin) {
            throw new Error('Cannot reply to a message from another group');
        }
        this.replyInfo = {
            sequence: message.sequence,
            senderUin: message.sender.uin,
            senderUid: message.sender.uid,
            messageUid: message.messageUid,
            elements: message[rawMessage][rawElems],
        };

        return this;
    }

    override image(data: Buffer, subType?: ImageSubType, summary?: string): this {
        this.segments.push((async () => {
            const imageMeta = getImageMetadata(data);
            this.bot[log].emit('trace', 'GroupMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
            const uploadResp = await this.bot[ctx].ops.call(
                'uploadGroupImage',
                this.groupUin,
                imageMeta,
                subType ?? ImageSubType.Picture,
                summary,
            );
            await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.GroupMessage);
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatFace: uploadResp.upload?.compatQMsg ?
                    CustomFaceElement.decode(uploadResp.upload.compatQMsg) :
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
                'GroupMessageBuilder',
                `Prepare to upload record ${JSON.stringify(recordMeta)}`,
            );
            const uploadResp = await this.bot[ctx].ops.call('uploadGroupRecord', this.groupUin, recordMeta, duration);
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
        const packer = new ForwardedMessagePacker(this.bot, this.groupUin);
        await packMsg(packer);
        const pack = await packer.pack();
        this.segments.push(pack);
        return pack;
    }

    override async build(clientSequence: number): Promise<OutgoingGroupMessage> {
        for (let i = 0; i < this.segments.length; i++) {
            if (isPromise(this.segments[i])) this.segments[i] = await this.segments[i];
        }

        return {
            type: MessageType.GroupMessage,
            groupUin: this.groupUin,
            clientSequence,
            random: randomInt(0, 0xffffffff),
            segments: this.segments as OutgoingSegment[],
            reply: this.replyInfo,
        };
    }
}
