import { OneBotEvent } from '@/event';
import { OneBotApp } from '@/index';

export abstract class OneBotNetworkAdapter<T> {
    constructor(readonly app: OneBotApp, readonly adapterConfig: T) {}

    abstract start(): void | Promise<void>;

    abstract stop(): void | Promise<void>;

    abstract emitEvent(event: OneBotEvent): void | Promise<void>;
}
