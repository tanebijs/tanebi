import { Bot } from '@/app';

export abstract class BotEntity<T> {
    constructor(
        public bot: Bot,
        protected data: T,
    ) {}

    updateBinding(data: T) {
        this.data = data;
    }
}