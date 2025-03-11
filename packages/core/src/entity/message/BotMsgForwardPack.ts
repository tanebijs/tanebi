import { IncomingSegmentOf } from '@/internal/message/incoming';
import { BotMsgType } from '.';
import { Bot, ctx } from '@/index';

export class BotMsgForwardPack implements BotMsgType {
    constructor(
        private readonly senderUid: string,
        private readonly segment: IncomingSegmentOf<'forward'>,
        private readonly bot: Bot,
    ) {}

    get recursiveCount() {
        return this.segment.recursiveCount;
    }

    get preview() {
        return this.segment.preview;
    }

    async download() {
        return await this.bot[ctx].ops.call('downloadLongMessage', this.senderUid, this.segment.resId);
    }

    toPreviewString() {
        return '[聊天记录]';
    }
}