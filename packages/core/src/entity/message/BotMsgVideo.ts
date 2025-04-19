import { Bot, ctx } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { BotMsgType } from '.';

export class BotMsgVideo implements BotMsgType {
    private constructor(
        readonly width: number,
        readonly height: number,
        readonly fileSize: number,
        readonly url: string,
    ) {}

    static async create(data: IncomingSegmentOf<'video'>, msg: IncomingMessage, bot: Bot) {
        return new BotMsgVideo(
            data.indexNode.info?.width ?? 0,
            data.indexNode.info?.height ?? 0,
            data.indexNode.info?.fileSize ?? 0,
            await bot[ctx].ops.call('downloadVideo', msg.senderUid!, data.indexNode, msg.type),
        );
    }

    static async createForward(data: IncomingSegmentOf<'video'>, messageType: MessageType, bot: Bot) {
        return new BotMsgVideo(
            data.indexNode.info?.width ?? 0,
            data.indexNode.info?.height ?? 0,
            data.indexNode.info?.fileSize ?? 0,
            await bot[ctx].ops.call('downloadVideo', 'u_B-xbHgFtPzMTjvfvZNVuqw', data.indexNode, messageType),
        );
    }

    toPreviewString(): string {
        return `[视频 ${this.width}x${this.height}]`;
    }
}
