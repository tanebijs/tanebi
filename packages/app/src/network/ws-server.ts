import { WebSocketServerAdapterConfig } from '@app/common/config';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';
import { Context, Hono } from 'hono';
import { HttpBindings, serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Server } from 'node:http';
import { WSContext, WSEvents } from 'hono/ws';
import { Failed } from '@app/action';
import { zWebSocketInputData } from '@app/common/types';
import { OneBotEvent } from '@app/event';
import { OneBotHeartbeatEvent } from '@app/event/meta';
import { get_status } from '@app/action/system/get_status';

export class OneBotWebSocketServerAdapter extends OneBotNetworkAdapter<WebSocketServerAdapterConfig> {
    readonly honoApp;
    eventPushClients = new Map<WSContext, string>();
    httpServer: Server | undefined;
    injectWebSocket;
    heartbeatRef: NodeJS.Timeout | undefined;

    constructor(app: OneBotApp, config: WebSocketServerAdapterConfig, id: string) {
        super(app, config, 'WsServer', id);
        this.honoApp = new Hono<{ Bindings: HttpBindings }>();
        const nodeWebSocket = createNodeWebSocket({ app: this.honoApp });
        const upgradeWebSocket = nodeWebSocket.upgradeWebSocket;
        this.injectWebSocket = nodeWebSocket.injectWebSocket;

        if (config.accessToken) {
            this.honoApp.use(async (c, next) => {
                let inputToken;
                const authorization = c.req.header('Authorization');
                if (authorization) {
                    const [type, token] = authorization.split(' ');
                    if (type === 'Bearer') {
                        inputToken = token;
                    }
                } else {
                    inputToken = c.req.query('access_token');
                }
    
                if (!inputToken) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Unauthorized)`);
                    c.status(401);
                    return c.json(Failed(401, 'Access token is missing'));
                }
    
                if (inputToken !== config.accessToken) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Forbidden)`);
                    c.status(403);
                    return c.json(Failed(403, 'Invalid access token'));
                }
                await next();
            });
        }

        const createOnMessage: (id: string) => WSEvents['onMessage'] =
            (ip: string) => async (evt: MessageEvent, ws) => {
                if (typeof evt.data !== 'string') {
                    ws.send(JSON.stringify(Failed(1400, 'Invalid payload')));
                    return;
                }

                const parseResult = zWebSocketInputData.safeParse(JSON.parse(evt.data));
                if (!parseResult.success) {
                    ws.send(JSON.stringify(Failed(1400, 'Invalid payload')));
                    return;
                }

                const { action, params, echo } = parseResult.data;
                const start = Date.now();
                const callResult = await this.app.actions.handleAction(action, params);
                const end = Date.now();
                this.logger.info(`${ip} -> /${action} (${callResult.retcode === 0 ? 'OK' : callResult.retcode} ${end - start}ms)`);
                ws.send(
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
            };

        this.honoApp.get(
            '/api',
            upgradeWebSocket((c: Context<{ Bindings: HttpBindings }>) => {
                return {
                    onOpen: () => {
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /api (Open)`);
                    },
                    onMessage: createOnMessage(c.env.incoming.socket.remoteAddress!),
                    onClose: () => {
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /api (Closed)`);
                    },
                };
            })
        );

        this.honoApp.get(
            '/event',
            upgradeWebSocket((c: Context<{ Bindings: HttpBindings }>) => {
                return {
                    onOpen: (_, ws) => {
                        this.eventPushClients.set(ws, c.env.incoming.socket.remoteAddress!);
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /event (Open)`);
                    },
                    onClose: (_, ws) => {
                        this.eventPushClients.delete(ws);
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /event (Closed)`);
                    },
                };
            })
        );

        this.honoApp.get(
            '/', // both API and Event features
            upgradeWebSocket((c: Context<{ Bindings: HttpBindings }>) => {
                return {
                    onOpen: (_, ws) => {
                        this.eventPushClients.set(ws, c.env.incoming.socket.remoteAddress!);
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> / (Open)`);
                    },
                    onMessage: createOnMessage(c.env.incoming.socket.remoteAddress!),
                    onClose: (_, ws) => {
                        this.eventPushClients.delete(ws);
                        this.logger.info(`${c.env.incoming.socket.remoteAddress} -> / (Closed)`);
                    },
                };
            })
        );
    }

    override startImpl() {
        this.httpServer = serve({
            fetch: this.honoApp.fetch,
            port: this.adapterConfig.port,
            hostname: this.adapterConfig.host,
        }) as Server;
        this.injectWebSocket(this.httpServer);
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

    override stopImpl() {
        if (this.heartbeatRef) {
            clearInterval(this.heartbeatRef);
            this.heartbeatRef = undefined;
        }
        this.httpServer?.closeAllConnections();
        this.httpServer = undefined;
    }

    override async emitEvent(event: OneBotEvent): Promise<void> {
        if (this.eventPushClients.size === 0) {
            return;
        }
        const body = JSON.stringify(event);
        for (const client of this.eventPushClients.keys()) {
            try {
                client.send(body);
            } catch (e) {
                this.logger.warn(`Failed to send event to ${this.eventPushClients.get(client)}: ${e}`);
            }
        }
    }
}
