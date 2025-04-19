import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';

export abstract class OneBotNetworkAdapter<T> {
    readonly logger;

    constructor(
        readonly app: OneBotApp,
        readonly adapterConfig: T,
        readonly type: string,
        readonly id: string,
    ) {
        this.logger = app.logger.child({ module: `${type}#${id}` });
    }

    async start(): Promise<void> {
        await this.startImpl();
        this.logger.info('Adapter started');
    }

    async stop(): Promise<void> {
        await this.stopImpl();
        this.logger.info('Adapter stopped');
    }

    abstract startImpl(): void | Promise<void>;

    abstract stopImpl(): void | Promise<void>;

    abstract emitEvent(event: OneBotEvent): void | Promise<void>;
}
