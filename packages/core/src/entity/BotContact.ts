import { Bot } from '@/index';
import { BotEntity } from '@/entity';
import { OutgoingSegment, OutgoingSegmentOf } from '@/internal/message/outgoing';

export abstract class BotContact<T extends { uin: number } = { uin: number }> extends BotEntity<T> {
    protected constructor(bot: Bot, data: T) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }
}

export type { OutgoingSegment, OutgoingSegmentOf };