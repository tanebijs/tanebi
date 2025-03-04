import { Bot, ctx, ImageSubType } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';

export class BotMsgImage {
    private constructor(
        readonly url: string,
        readonly width: number,
        readonly height: number,
        readonly subType: ImageSubType,
        readonly summary: string,
    ) {}

    static async create(data: IncomingSegmentOf<'image'>, msg: IncomingMessage, bot: Bot) {
        if (data.url) {
            return new BotMsgImage(
                data.url,
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        if (data.indexNode) {
            return new BotMsgImage(
                msg.type === MessageType.PrivateMessage ?
                    await bot[ctx].ops.call('downloadPrivateImage', msg.senderUid!, data.indexNode) :
                    await bot[ctx].ops.call('downloadGroupImage', msg.groupUin, data.indexNode),
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        throw new Error('Unexpected input data');
    }

    toPreviewString() {
        return this.summary;
    }
}

export { ImageSubType } from '@/internal/message/incoming/segment/image';