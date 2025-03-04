import { BotGroup, BotGroupMember, BotGroupMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingGroupMessage } from '@/internal/message/outgoing';
import { ImageBizType } from '@/internal/message/outgoing/segment/image';
import { getImageMetadata } from '@/internal/util/media/image';
import { rawElems } from '@/message';
import { ctx, log } from '@/index';

export class GroupMessageBuilder extends AbstractMessageBuilder {
    repliedMessage?: BotGroupMessage;

    constructor(private readonly group: BotGroup) {
        super(group);
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
            name: '@' + (member.card || member.nickname) 
        });
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
    }

    /**
     * Reply to a group message
     */
    reply(message: BotGroupMessage) {
        if (message.sender.group.uin !== this.group.uin) {
            throw new Error('Cannot reply to a message from another group');
        }
        this.repliedMessage = message;
    }
    
    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.group.bot[log].emit('debug', 'GroupMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.group.bot[ctx].ops.call(
            'uploadGroupImage', 
            this.group.uin,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.group.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.GroupMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            bizType: ImageBizType.Group,
            // compatFace: CustomFaceElement.decode(uploadResp.upload!.compatQMsg!),
        });
    }

    override build(clientSequence: number): OutgoingGroupMessage {
        return {
            type: MessageType.GroupMessage,
            groupUin: this.contact.uin,
            clientSequence,
            segments: this.segments,
            reply: this.repliedMessage ? {
                sequence: this.repliedMessage.sequence,
                senderUin: this.repliedMessage.sender.uin,
                senderUid: this.repliedMessage.sender.uid,
                messageUid: this.repliedMessage.messageUid,
                elements: this.repliedMessage[rawElems],
            } : undefined,
        };
    }
}