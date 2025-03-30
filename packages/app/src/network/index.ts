import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';

export abstract class OneBotNetworkAdapter<T> {
    readonly logger;

    constructor(
        readonly app: OneBotApp,
        readonly adapterConfig: T,
        readonly type: string,
        readonly id: string
    ) {
        this.logger = app.logger.child({ module: `${type}#${id}` });
    }

    abstract start(): void | Promise<void>;

    abstract stop(): void | Promise<void>;

    abstract emitEvent(event: OneBotEvent): void | Promise<void>;
}
