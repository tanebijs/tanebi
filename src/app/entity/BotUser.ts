import { Bot } from '@/app';
import { BotEntity } from '@/app/entity';

export abstract class BotUser<T extends { uin: number, uid?: string }> extends BotEntity<T> {
    protected constructor(
        public readonly bot: Bot,
        public readonly data: T,
    ) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }

    get uid() {
        return this.data.uid;
    }
}