import { Failed } from '@app/action';
import { HttpServerAdapterConfig } from '@app/common/config';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';
import { Hono } from 'hono';
import { HttpBindings, serve } from '@hono/node-server';
import { StatusCode } from 'hono/utils/http-status';
import { Server } from 'node:http';

export class OneBotHttpServerAdapter extends OneBotNetworkAdapter<HttpServerAdapterConfig> {
    readonly honoApp;
    httpServer: Server | undefined;

    constructor(app: OneBotApp, config: HttpServerAdapterConfig, id: string) {
        super(app, config, 'HttpServer', id);
        this.honoApp = new Hono<{ Bindings: HttpBindings }>();
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

        this.honoApp.all('/:endpoint', async (c) => {
            const endpoint = c.req.param('endpoint');
            const payload = c.req.method === 'GET' ? c.req.query() : await c.req.json();
            const start = Date.now();
            const response = await this.app.actions.handleAction(endpoint, payload);
            const end = Date.now();
            this.logger.info(
                `${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (${
                    response.retcode === 0 ? 'OK' : response.retcode
                } ${end - start}ms)`
            );
            c.status((response.retcode >= 400 && response.retcode < 500 ? response.retcode : 200) as StatusCode);
            return c.json(response);
        });
    }

    override startImpl() {
        this.httpServer = serve({
            fetch: this.honoApp.fetch,
            port: this.adapterConfig.port,
            hostname: this.adapterConfig.host,
        }) as Server;
    }

    override stopImpl() {
        this.httpServer?.closeAllConnections();
    }

    // Http server does not emit events
    override emitEvent() {}
}
