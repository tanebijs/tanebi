import { BotFriend, BotFriendMessage } from '@/app/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/core/message';
import { ImageSubType } from '@/core/message/incoming/segment/image';
import { OutgoingPrivateMessage } from '@/core/message/outgoing';
import { ImageBizType } from '@/core/message/outgoing/segment/image';
import { getImageMetadata } from '@/core/util/media/image';
import { rawElems } from '@/core/message/incoming';

export class PrivateMessageBuilder extends AbstractMessageBuilder {
    repliedMessage?: BotFriendMessage;

    constructor(private readonly friend: BotFriend) {
        super(friend);
    }

    reply(message: BotFriendMessage) {
        this.repliedMessage = message;
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.friend.bot.log.emit('debug', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
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
            reply: this.repliedMessage ? {
                sequence: this.repliedMessage.sequence,
                senderUin: this.friend.uin,
                senderUid: this.friend.uid,
                messageUid: this.repliedMessage.messageUid,
                elements: this.repliedMessage[rawElems],
            } : undefined,
            repliedClientSequence: this.repliedMessage?.clientSequence,
        };
    }
}