import { Bot, ctx } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { BotMsgType } from '.';

export class BotMsgRecord implements BotMsgType {
    private constructor(
        readonly duration: number,
        readonly url: string,
    ) {}

    static async create(data: IncomingSegmentOf<'record'>, msg: IncomingMessage, bot: Bot) {
        return new BotMsgRecord(
            data.indexNode?.info?.time ?? 0,
            msg.type === MessageType.PrivateMessage ?
                await bot[ctx].ops.call('downloadPrivateRecord', msg.senderUid!, data.indexNode) :
                await bot[ctx].ops.call('downloadGroupRecord', msg.groupUin, data.indexNode),
        );
    }

    toPreviewString(): string {
        return `[语音 ${this.duration}s]`;
    }
}
