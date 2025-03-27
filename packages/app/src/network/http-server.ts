import { Failed } from '@/action';
import { HttpServerAdapterConfig } from '@/common/config';
import { OneBotApp } from '@/index';
import { OneBotNetworkAdapter } from '@/network';
import express, { Express } from 'express';
import http from 'node:http';

export class OneBotHttpServerAdapter extends OneBotNetworkAdapter<HttpServerAdapterConfig> {
    readonly expressApp: Express;
    readonly httpServer: http.Server;

    constructor(app: OneBotApp, config: HttpServerAdapterConfig) {
        super(app, config);
        this.expressApp = express();
        this.expressApp.use(express.json());

        this.expressApp.use((req, res, next) => {
            if (req.headers['content-type'] && req.headers['content-type'] !== 'application/json') {
                res.status(406).json(Failed(406, 'Unsupported Content-Type'));
                return;
            }

            // In case the client forgets to set the Content-Type header
            req.headers['content-type'] = 'application/json';
            next();
        });

        if (config.accessToken) {
            this.expressApp.use((req, res, next) => {
                let inputToken;
                if (req.headers.authorization) {
                    const [type, token] = req.headers.authorization.split(' ');
                    if (type === 'Bearer') {
                        inputToken = token;
                    }
                } else {
                    inputToken = req.query['access_token'];
                }

                if (!inputToken) {
                    res.status(401).json(Failed(401, 'Access token is missing'));
                    return;
                }

                if (inputToken !== config.accessToken) {
                    res.status(403).json(Failed(403, 'Wrong access token'));
                    return;
                }

                next();
            });
        }

        this.expressApp.all('/:endpoint', async (req, res) => {
            const endpoint = req.params.endpoint;
            const payload = req.body;
            const response = await this.app.actions.handleAction(endpoint, payload);
            res.status(response.retcode >= 400 && response.retcode < 500 ? response.retcode : 200).json(response);
        });

        this.httpServer = http.createServer(this.expressApp);
    }

    override start() {
        return new Promise<void>((resolve) => {
            this.httpServer.listen(this.adapterConfig.port, this.adapterConfig.host, () => resolve());
        });
    }

    override stop() {
        return new Promise<void>((resolve, reject) => {
            this.httpServer.close((err) => err ? reject(err) : resolve());
        });
    }

    // Http server does not emit events
    override emitEvent() {}
}
