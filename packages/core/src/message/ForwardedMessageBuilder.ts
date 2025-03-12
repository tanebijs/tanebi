import { Bot, ctx, ImageSubType, log } from '@/index';
import { AbstractMessageBuilder, ForwardedMessagePacker } from '.';
import { OutgoingForwardedMessage } from '@/internal/message/outgoing/forwarded';
import { MessageType } from '@/internal/message';
import { getImageMetadata } from '@/internal/util/media/image';
import { randomInt } from '@/internal/util/random';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';

export class ForwardedMessageBuilder extends AbstractMessageBuilder {
    constructor(private readonly uin: number, private readonly nick: string, bot: Bot) {
        super(bot);
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.bot[log].emit('debug', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.bot[ctx].ops.call(
            'uploadPrivateImage', 
            this.bot.uid,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary,
        );
        await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            compatImage: uploadResp.upload?.compatQMsg ? NotOnlineImageElement.decode(uploadResp.upload.compatQMsg) : undefined,
        });
    }

    override async forward(packMsg: (p: ForwardedMessagePacker) => void | Promise<void>): Promise<void> {
        const packer = new ForwardedMessagePacker(this.bot);
        await packMsg(packer);
        this.segments.push(await packer.pack());
    }

    override async record(): Promise<void> {
        // throw new Error('Cannot send voice messages in a forwarded message');
        this.bot[log].emit('warning', 'ForwardedMessageBuilder', 'Cannot send voice messages in a forwarded message');
        return;
    }

    override build(clientSequence: number): OutgoingForwardedMessage {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.uin,
            targetUid: this.bot.uid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: this.segments,
            nick: this.nick,
        };
    }
}

export { type OutgoingForwardedMessage };