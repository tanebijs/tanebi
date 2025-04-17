import { Byte, Encoder } from '@nuintun/qrcode';
import { Bot, fetchAppInfoFromSignUrl, type Keystore, UrlSignProvider } from 'tanebi';
import logger, { type Level } from '../loggers/logger';
import deviceutil from './deviceutil';
import keystoreutil from './keystoreutil';

const log = (level: Level, module: string, message: string) => logger.tag(`Bot::${module}`)[level](message);
const trace = (module: string, message: string) => log('trace', module, message);
const info = (module: string, message: string) => log('info', module, message);
const warning = (module: string, message: string) => log('warning', module, message);
const fatal = (module: string, message: string) => log('fatal', module, message);

const offline = (title: string, tip: string) => logger.fatal(`${title}::${tip}`);

const create = async (url: string) => {
    const appinfo = await fetchAppInfoFromSignUrl(url);
    const config = {};
    const device = await deviceutil.initialize();
    const keystore = await keystoreutil.initialize();
    const signer = UrlSignProvider(url);

    const bot = await Bot.create(appinfo, config, device, keystore, signer);

    bot.onTrace(trace);
    bot.onInfo(info);
    bot.onWarning(warning);
    bot.onFatal(fatal);

    bot.onForceOffline(offline);
    bot.onKeystoreChange(keystoreutil.save);

    return bot;
};

const blocks = {
    0: { 0: ' ', 1: '▄' },
    1: { 0: '▀', 1: '█' },
};
const qrcode = (url: string) => {
    const image = new Encoder({ level: 'L' }).encode(new Byte(url));

    let output = '';
    for (let y = 0; y < image.size; y += 2) {
        for (let x = 0; x < image.size; x += 1) {
            const top = image.get(x, y) as 0 | 1;
            const bottom = (y + 1 < image.size ? image.get(x, y + 1) : 0) as 0 | 1;

            output += blocks[top][bottom];
        }
    }
};

export default {
    base: (url: string) => {
        const botPromise = create(url);

        const result = {
            configure: (configure: (bot: Bot) => void) => {
                botPromise.then(configure);
                return result;
            },
            login: async () => {
                const bot = await botPromise;
                try {
                    await bot.fastLogin();
                } catch (error) {
                    logger.warning(`Fast login failed! Fallback to qrcode login! Because ${error}`);

                    await bot.qrCodeLogin(qrcode);
                }
                return bot;
            },
        };

        return result;
    },
};
