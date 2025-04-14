import { Failed } from '@app/action';
import { get_status } from '@app/action/system/get_status';
import { WebSocketClientAdapterConfig } from '@app/common/config';
import { zWebSocketInputData } from '@app/common/types';
import { OneBotEvent } from '@app/event';
import { OneBotHeartbeatEvent, OneBotLifecycleEvent } from '@app/event/meta';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';
import { WebSocket } from 'ws';

export class OneBotWebSocketClientAdapter extends OneBotNetworkAdapter<WebSocketClientAdapterConfig> {
    websocket: WebSocket | undefined;
    heartbeatRef: NodeJS.Timeout | undefined;

    constructor(app: OneBotApp, config: WebSocketClientAdapterConfig, id: string) {
        super(app, config, 'WsClient', id);
    }

    override startImpl() {
        return new Promise<void>((resolve) => {
            this.websocket = new WebSocket(this.adapterConfig.url, {
                headers: {
                    'X-Self-ID': '' + this.app.bot.uin,
                    'User-Agent': 'OneBot/11',
                },
            });
            this.websocket.on('open', () => {
                this.websocket!.send(JSON.stringify(new OneBotLifecycleEvent(this.app, 'connect')));
                resolve();
            });
            this.websocket.on('message', async (data) => {
                const payload = data.toString();
                const parseResult = zWebSocketInputData.safeParse(JSON.parse(payload));
                if (!parseResult.success) {
                    this.websocket?.send(JSON.stringify(Failed(1400, 'Invalid payload')));
                    return;
                }

                const { action, params, echo } = parseResult.data;
                const start = Date.now();
                const callResult = await this.app.actions.handleAction(action, params);
                const end = Date.now();
                this.logger.info(
                    `/${action} (${callResult.retcode === 0 ? 'OK' : callResult.retcode} ${end - start}ms)`
                );
                this.websocket?.send(
                    JSON.stringify({
                        status: callResult.status,
                        retcode:
                            callResult.retcode >= 400 && callResult.retcode < 500
                                ? 1000 + callResult.retcode
                                : callResult.retcode,
                        data: callResult.data,
                        echo: echo,
                    })
                );
            });
            this.websocket.on('close', () => {
                this.websocket = undefined;
                this.logger.warn(`Lost connection, reconnecting in ${this.adapterConfig.reconnectInterval}ms`);
                this.stopImpl();
                setTimeout(() => {
                    this.logger.info('Reconnecting...');
                    this.startImpl();
                }, this.adapterConfig.reconnectInterval);
            });
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
        });
    }

    override stopImpl() {
        this.websocket?.close();
        if (this.heartbeatRef) {
            clearInterval(this.heartbeatRef);
            this.heartbeatRef = undefined;
        }
        this.websocket = undefined;
    }

    override emitEvent(event: OneBotEvent) {
        if (this.websocket) {
            this.websocket.send(JSON.stringify(event));
        } else {
            this.logger.warn('WebSocket client not connected, cannot emit event');
        }
    }
}
