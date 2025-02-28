import { BotGroup, BotGroupMember } from '@/app/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/core/message';
import { ImageSubType } from '@/core/message/incoming/segment/image';
import { OutgoingGroupMessage } from '@/core/message/outgoing';
import { ImageBizType } from '@/core/message/outgoing/segment/image';
import { getImageMetadata } from '@/core/util/media/image';

export class GroupMessageBuilder extends AbstractMessageBuilder {
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
    
    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.group.bot.log.emit('debug', 'GroupMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.group.bot.ctx.ops.call(
            'uploadGroupImage', 
            this.group.uin,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.group.bot.ctx.highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.GroupMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            bizType: ImageBizType.Group,
            // compatFace: CustomFaceElement.decode(uploadResp.upload!.compatQMsg!),
        });
    }

    override build(): OutgoingGroupMessage {
        return {
            type: MessageType.GroupMessage,
            groupUin: this.contact.uin,
            clientSequence: this.group.clientSequence++,
            segments: this.segments,
            repliedSequence: this.repliedSequence,
        };
    }
}