import { Bot, ctx, ImageSubType, log, type OutgoingSegment, OutgoingSegmentOf } from '@/index';
import { MessageType } from '@/internal/message';
import { OutgoingForwardedMessage } from '@/internal/message/outgoing/forwarded';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { getImageMetadata } from '@/internal/util/media/image';
import { randomInt } from '@/internal/util/random';
import { isPromise } from 'node:util/types';
import { AbstractMessageBuilder, ForwardedMessagePacker } from '.';

export class ForwardedMessageBuilder extends AbstractMessageBuilder {
    constructor(private readonly uin: number, private readonly nick: string, bot: Bot) {
        super(bot);
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
                this.bot.uid,
                imageMeta,
                subType ?? ImageSubType.Picture,
                summary,
            );
            await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatImage: uploadResp.upload?.compatQMsg ?
                    NotOnlineImageElement.decode(uploadResp.upload.compatQMsg) :
                    undefined,
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

    override record(): this {
        // throw new Error('Cannot send voice messages in a forwarded message');
        this.bot[log].emit('warning', 'ForwardedMessageBuilder', 'Cannot send voice messages in a forwarded message');
        return this;
    }

    override async build(clientSequence: number): Promise<OutgoingForwardedMessage> {
        for (let i = 0; i < this.segments.length; i++) {
            if (isPromise(this.segments[i])) this.segments[i] = await this.segments[i];
        }

        return {
            type: MessageType.PrivateMessage,
            targetUin: this.uin,
            targetUid: this.bot.uid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: this.segments as OutgoingSegment[],
            nick: this.nick,
        };
    }
}

export { type OutgoingForwardedMessage };
