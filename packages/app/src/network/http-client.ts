import { get_status } from '@app/action/system/get_status';
import { HttpClientAdapterConfig } from '@app/common/config';
import { OneBotEvent } from '@app/event';
import { OneBotHeartbeatEvent } from '@app/event/meta';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';
import { createHmac } from 'node:crypto';

export class OneBotHttpClientAdapter extends OneBotNetworkAdapter<HttpClientAdapterConfig> {
    private isStarted = false;
    private heartbeatRef: NodeJS.Timeout | undefined;
    private buildHeaders: (body: string) => Record<string, string>;

    constructor(app: OneBotApp, config: HttpClientAdapterConfig, id: string) {
        super(app, config, 'HttpClient', id);
        const xSelfId = '' + this.app.bot.uin;
        this.buildHeaders = config.signatureSecret
            ? (body) => {
                const hmac = createHmac('sha256', config.signatureSecret!);
                hmac.update(body);
                const signature = hmac.digest('hex');
                return {
                    'Content-Type': 'application/json',
                    'X-Self-ID': xSelfId,
                    'X-Signature': `sha1=${signature}`,
                };
            }
            : () => ({
                'Content-Type': 'application/json',
                'X-Self-ID': xSelfId,
            });
    }

    override async startImpl() {
        this.isStarted = true;
        if (this.adapterConfig.enableHeartbeat && this.adapterConfig.heartbeatInterval) {
            this.heartbeatRef = setInterval(() => {
                const heartbeatEvent = new OneBotHeartbeatEvent(
                    this.app,
                    get_status.handler(this.app, {}),
                    this.adapterConfig.heartbeatInterval!,
                );
                this.emitEvent(heartbeatEvent);
            }, this.adapterConfig.heartbeatInterval);
        }
    }

    override async stopImpl() {
        this.isStarted = false;
        if (this.heartbeatRef) {
            clearInterval(this.heartbeatRef);
            this.heartbeatRef = undefined;
        }
    }

    override async emitEvent(event: OneBotEvent): Promise<void> {
        if (!this.isStarted) {
            return;
        }
        const body = JSON.stringify(event);
        await fetch(this.adapterConfig.url, {
            method: 'post',
            headers: this.buildHeaders(body),
            body,
        });
        // TODO: handle quick operations
    }
}