import { BotFriend } from '@/app/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/core/message';
import { ImageSubType } from '@/core/message/incoming/segment/image';
import { OutgoingPrivateMessage } from '@/core/message/outgoing';
import { ImageBizType } from '@/core/message/outgoing/segment/image';
import { getImageMetadata } from '@/core/util/media/image';

export class PrivateMessageBuilder extends AbstractMessageBuilder {
    constructor(private readonly friend: BotFriend) {
        super(friend);
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        const uploadResp = await this.friend.bot.ctx.ops.call(
            'uploadPrivateImage', 
            this.friend.uid,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.friend.bot.ctx.highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            bizType: ImageBizType.Group,
            // compatFace: CustomFaceElement.decode(uploadResp.upload!.compatQMsg!),
        });
    }

    override build(): OutgoingPrivateMessage {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.contact.uin,
            targetUid: this.friend.uid,
            clientSequence: this.friend.clientSequence++,
            segments: this.segments,
        };
    }
}