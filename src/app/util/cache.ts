import { Bot } from '@/app';
import { BotEntity } from '@/app/entity';

type ExtractDataBinding<V> = V extends BotEntity<infer U> ? U : never;

export class BotCacheService<K, V extends BotEntity<unknown>>{
    private readonly map = new Map<K, V>();

    constructor(
        public readonly bot: Bot,
        private readonly updateCache: (bot: Bot) => Promise<Map<K, ExtractDataBinding<V>>>,
        private readonly entityFactory: (bot: Bot, data: ExtractDataBinding<V>) => V,
    ) {
    }

    async get(key: K, forceUpdate = false) {
        if (!this.map.has(key) || forceUpdate) {
            await this.update();
        }
        return this.map.get(key);
    }

    async getAll(forceUpdate = false) {
        if (forceUpdate || this.map.size === 0) {
            await this.update();
        }
        return this.map.values();
    }

    async update() {
        const data = await this.updateCache(this.bot);
        this.acceptData(data);
    }

    acceptData(data: Map<K, ExtractDataBinding<V>>) {
        for (const [key, value] of data.entries()) {
            const entity = this.map.get(key);
            if (entity) {
                entity.updateBinding(value);
            } else {
                this.map.set(key, this.entityFactory(this.bot, value));
            }
        }
    }
}