import {
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    DeviceInfo,
    fetchAppInfoFromSignUrl,
    Keystore,
    newDeviceInfo,
    newKeystore,
    serializeDeviceInfo,
    serializeKeystore,
    UrlSignProvider,
} from 'tanebi';
import { generate, QRErrorCorrectLevel } from 'ts-qrcode-terminal';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import fs from 'node:fs';
import path from 'node:path';
import { Config, exampleConfig, zConfig } from '@/common/config';
import { ActionCollection } from '@/action';
import { OneBotNetworkAdapter } from '@/network';
import { OneBotHttpServerAdapter } from '@/network/http-server';

export class OneBotApp {
    readonly actions = new ActionCollection(this, []);
    readonly adapters: OneBotNetworkAdapter<unknown>[];

    private constructor(
        readonly baseDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly db: ReturnType<typeof drizzle>,
        readonly config: Config
    ) {
        this.adapters = config.adapters.map((adapterConfig) => {
            if (adapterConfig.type === 'httpServer') {
                return new OneBotHttpServerAdapter(this, adapterConfig);
            }
            throw new Error(`Unsupported adapter type: ${adapterConfig.type}`);
        });
    }

    async start() {
        await Promise.all(this.adapters.map((adapter) => adapter.start()));
        if (this.isFirstRun) {
            const qrCodePath = path.join('data', 'qrCode.png');
            await this.bot.qrCodeLogin((url, png) => {
                fs.writeFileSync(qrCodePath, png);
                console.info('Please scan the QR code below to login:');
                generate(url, { small: true, qrErrorCorrectLevel: QRErrorCorrectLevel.L });
                console.info(`QR code image saved to ${qrCodePath}.`);
                console.info('Or you can generate a QR code with the following URL:');
                console.info(url);
            });
        } else {
            await this.bot.fastLogin();
        }
    }

    static async create(baseDir: string) {
        let bot: Bot;

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        const configPath = path.join(baseDir, 'config.json');

        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 4));
            console.info(`Example config file created at ${configPath}.`);
            console.info('Please edit the config file and press any key to continue.');
            await new Promise((resolve) => process.stdin.once('data', resolve));
        }

        const config = zConfig.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
        const userDataDir = path.join(baseDir, '' + config.botUin);

        //#region Bot Initialization
        const deviceInfoPath = path.join(userDataDir, 'deviceInfo.json');
        const keystorePath = path.join(userDataDir, 'keystore.json');

        const appInfo = await fetchAppInfoFromSignUrl(config.signApiUrl);
        const signProvider = UrlSignProvider(config.signApiUrl);

        let deviceInfo: DeviceInfo;
        if (!fs.existsSync(deviceInfoPath)) {
            deviceInfo = newDeviceInfo();
            fs.writeFileSync(deviceInfoPath, JSON.stringify(serializeDeviceInfo(deviceInfo)));
        } else {
            deviceInfo = deserializeDeviceInfo(JSON.parse(fs.readFileSync(deviceInfoPath, 'utf-8')));
        }

        let keystore: Keystore;
        let isFirstRun = false;
        if (!fs.existsSync(keystorePath)) {
            keystore = newKeystore();
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
            isFirstRun = true;
        } else {
            keystore = deserializeKeystore(JSON.parse(fs.readFileSync(keystorePath, 'utf-8')));
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
        }

        bot.onKeystoreChange((keystore) => {
            fs.writeFileSync(keystorePath, JSON.stringify(serializeKeystore(keystore)));
        });
        //#endregion

        //#region Database Initialization
        const dbPath = path.join(userDataDir, 'data.db');
        const db = drizzle('file:' + dbPath);
        await migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, '..', 'drizzle') });
        //#endregion

        return new OneBotApp(baseDir, isFirstRun, bot, db, config);
    }
}

async function main() {
    const app = await OneBotApp.create('data');
    await app.start();
}

main();
