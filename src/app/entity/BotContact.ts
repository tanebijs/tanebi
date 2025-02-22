import { Bot } from '@/app';
import { BotEntity } from '@/app/entity';
import { OutgoingSegment, OutgoingSegmentOf } from '@/core/message/outgoing';

export abstract class BotContact<T extends { uin: number } = { uin: number }> extends BotEntity<T> {
    protected constructor(
        public readonly bot: Bot,
        public readonly data: T,
    ) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }
}

export type { OutgoingSegment, OutgoingSegmentOf };