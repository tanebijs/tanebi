import { Bot } from '@/app';
import { BotUser } from '@/app/entity';
import { OutgoingMessage } from '@/message/outgoing';

export abstract class BotContact<T extends { uin: number, uid: string }> extends BotUser<T> {
    protected constructor(
        public readonly bot: Bot,
        public readonly data: T,
    ) {
        super(bot, data);
    }

    override get uid() { // should return a non-nullable value
        return this.data.uid;
    }

    // TODO: use stable type instead of OutgoingMessage
    abstract sendMsg(segments: OutgoingMessage['segments']): Promise<{ sequence: number, timestamp: number }>;
}