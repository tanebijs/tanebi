import { Failed } from '@app/action';
import { WebSocketClientAdapterConfig } from '@app/common/config';
import { zWebSocketInputData } from '@app/common/types';
import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';
import { WebSocket } from 'ws';

export class OneBotWebSocketClientAdapter extends OneBotNetworkAdapter<WebSocketClientAdapterConfig> {
    websocket: WebSocket | undefined;

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
            this.websocket.on('open', () => resolve());
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
        });
    }

    override stopImpl() {
        this.websocket?.close();
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
