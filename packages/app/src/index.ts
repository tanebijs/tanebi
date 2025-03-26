import { Bot, deserializeDeviceInfo, deserializeKeystore, DeviceInfo, fetchAppInfoFromSignUrl, Keystore, newDeviceInfo, newKeystore, serializeDeviceInfo, serializeKeystore, UrlSignProvider } from 'tanebi';
import fs from 'node:fs';
import path from 'node:path';
import { exampleConfig, zConfig } from '@/common/config';

class OneBotApp {
    private constructor(readonly bot: Bot) {}

    static async create(baseDir: string) {
        let bot: Bot;

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        const configPath = path.join(baseDir, 'config.json');
        const deviceInfoPath = path.join(baseDir, 'deviceInfo.json');
        const keystorePath = path.join(baseDir, 'keystore.json');
        const qrCodePath = path.join(baseDir, 'qrcode.png');

        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 4));
            console.info(`Example config file created at ${configPath}.`);
            console.info('Please edit the config file and press any key to continue.');
            await new Promise((resolve) => process.stdin.once('data', resolve));
        }

        const config = zConfig.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));

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
        if (!fs.existsSync(keystorePath)) {
            keystore = newKeystore();
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
            bot.onKeystoreChange((keystore) => {
                fs.writeFileSync(keystorePath, JSON.stringify(serializeKeystore(keystore)));
            });
            await bot.qrCodeLogin((url, png) => {
                fs.writeFileSync(qrCodePath, png);
                console.info(`QR code image saved to ${qrCodePath}.`);
                console.info('Or you can generate a QR code with the following URL:');
                console.info(url);
            });
        } else {
            keystore = deserializeKeystore(JSON.parse(fs.readFileSync(keystorePath, 'utf-8')));
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
            bot.onKeystoreChange((keystore) => {
                fs.writeFileSync(keystorePath, JSON.stringify(serializeKeystore(keystore)));
            });
            await bot.fastLogin();
        }
        return new OneBotApp(bot);
    }
}

OneBotApp.create('data');