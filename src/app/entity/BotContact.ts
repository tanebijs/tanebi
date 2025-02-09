import { Bot } from '@/app';
import { BotEntity } from '@/app/entity';
import { OutgoingSegment } from '@/core/message/outgoing';

export abstract class BotContact<T extends { uin: number }> extends BotEntity<T> {
    protected constructor(
        public readonly bot: Bot,
        public readonly data: T,
    ) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }

    // TODO: use stable type instead of OutgoingMessage
    abstract sendMsg(segments: OutgoingSegment[], repliedSequence?: number): Promise<{ sequence: number, timestamp: number }>;
}

export type { OutgoingSegment };