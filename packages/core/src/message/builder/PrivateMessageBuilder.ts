import { BotFriend, BotFriendMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';
import { ImageBizType } from '@/internal/message/outgoing/segment/image';
import { getImageMetadata } from '@/internal/util/media/image';
import { rawElems } from '@/message';
import { ctx, log } from '@/index';

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
        this.friend.bot[log].emit('debug', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.friend.bot[ctx].ops.call(
            'uploadPrivateImage', 
            this.friend.uid,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.friend.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            bizType: ImageBizType.Group,
            // compatFace: CustomFaceElement.decode(uploadResp.upload!.compatQMsg!),
        });
    }

    override build(clientSequence: number): OutgoingPrivateMessage {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.contact.uin,
            targetUid: this.friend.uid,
            clientSequence,
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