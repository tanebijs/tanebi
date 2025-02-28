import { Bot } from '@/app';
import { deserializeDeviceInfo, deserializeKeystore, fetchAppInfoFromSignUrl, UrlSignProvider } from '@/app/util';
import * as fs from 'node:fs';

if (!fs.existsSync('temp/deviceInfo.json') || !fs.existsSync('temp/keystore.json')) {
    console.error('Please perform QR code login first.');
    process.exit(1);
}

const signUrl = 'http://106.54.14.24:8084/api/sign/30366';

const bot = await Bot.create(
    await fetchAppInfoFromSignUrl(signUrl),
    {},
    deserializeDeviceInfo(JSON.parse(fs.readFileSync('temp/deviceInfo.json', 'utf-8'))),
    deserializeKeystore(JSON.parse(fs.readFileSync('temp/keystore.json', 'utf-8'))),
    UrlSignProvider(signUrl),
);

bot.onDebug((module, message) => {
    console.log(`[DEBUG] [${module}] ${message}`);
});

bot.onInfo((module, message) => {
    console.log(`[INFO]  [${module}] ${message}`);
});

bot.onWarning((module, message, e) => {
    console.log(`[WARN]  [${module}] ${message}`, e);
});

await bot.fastLogin();
console.log('User', bot.ctx.keystore.uin, 'logged in.');

export default bot;