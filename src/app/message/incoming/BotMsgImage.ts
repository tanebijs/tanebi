import { Bot } from '@/app';
import { MessageType } from '@/core/message';
import { IncomingMessage, IncomingSegmentOf } from '@/core/message/incoming';

export class BotMsgImage {
    private constructor(public readonly url: string) {} // TODO: add other metadata

    static async create(data: IncomingSegmentOf<'image'>, msg: IncomingMessage, bot: Bot) {
        if (data.url) {
            return new BotMsgImage(data.url);
        }

        if (data.indexNode) {
            return new BotMsgImage(msg.type === MessageType.PrivateMessage ?
                '' : // TODO: implement downloadPrivateImage
                await bot.ctx.ops.call('downloadGroupImage', msg.groupUin, data.indexNode),
            );
        }

        throw new Error('Unexpected input data');
    }

    toPreviewString() {
        return '[图片]';
    }
}