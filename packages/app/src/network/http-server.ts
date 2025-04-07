import express, { Express } from 'express';
import http from 'node:http';
import { Failed } from '@app/action';
import { HttpServerAdapterConfig } from '@app/common/config';
import { OneBotApp } from '@app/index';
import { OneBotNetworkAdapter } from '@app/network';

export class OneBotHttpServerAdapter extends OneBotNetworkAdapter<HttpServerAdapterConfig> {
    readonly expressApp: Express;
    readonly httpServer: http.Server;

    constructor(app: OneBotApp, config: HttpServerAdapterConfig, id: string) {
        super(app, config, 'HttpServer', id);
        this.expressApp = express();
        this.expressApp.use((req, res, next) => {
            if (req.method === 'POST') {
                if (req.headers['content-type']?.startsWith('text/plain')) {
                    // In case the client forgets to set the Content-Type header
                    req.headers['content-type'] = 'application/json';
                }
    
                if (req.headers['content-type'] !== 'application/json') {
                    res.status(406).json(Failed(406, 'Unsupported Content-Type'));
                    return;
                }
            }
            next();
        });
        this.expressApp.use(express.json());

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
                    this.logger.warn(`${req.ip} -> ${req.path} (Unauthorized)`);
                    res.status(401).json(Failed(401, 'Access token is missing'));
                    return;
                }

                if (inputToken !== config.accessToken) {
                    this.logger.warn(`${req.ip} -> ${req.path} (Forbidden)`);
                    res.status(403).json(Failed(403, 'Wrong access token'));
                    return;
                }

                next();
            });
        }

        this.expressApp.all('/:endpoint', async (req, res) => {
            const endpoint = req.params.endpoint;
            const payload = req.method === 'GET' ? req.query : req.body;
            const start = Date.now();
            const response = await this.app.actions.handleAction(endpoint, payload);
            const end = Date.now();
            this.logger.info(`${req.ip} -> ${req.path} (${response.retcode === 0 ? 'OK' : response.retcode} ${end - start}ms)`);
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
            this.httpServer.close((err) => (err ? reject(err) : resolve()));
        });
    }

    // Http server does not emit events
    override emitEvent() {}
}
