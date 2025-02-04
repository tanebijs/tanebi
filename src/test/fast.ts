import { Bot } from '@/app';
import { deserializeDeviceInfo, deserializeKeystore, UrlSignProvider } from '@/app/util';
import * as fs from 'node:fs';

if (!fs.existsSync('temp/deviceInfo.json') || !fs.existsSync('temp/keystore.json')) {
    console.error('Please perform QR code login first.');
    process.exit(1);
}

const bot = await Bot.create(
    {
        'Os': 'Linux',
        'VendorOs': 'linux',
        'Kernel': 'Linux',
        'CurrentVersion': '3.2.15-30366',
        'MiscBitmap': 32764,
        'PtVersion': '2.0.0',
        'SsoVersion': 19,
        'PackageName': 'com.tencent.qq',
        'WtLoginSdk': 'nt.wtlogin.0.0.1',
        'AppId': 1600001615,
        'SubAppId': 537258424,
        'AppIdQrCode': 13697054,
        'AppClientVersion': 30366,
        'MainSigMap': 169742560,
        'SubSigMap': 0,
        'NTLoginType': 1,
    },
    {},
    deserializeDeviceInfo(JSON.parse(fs.readFileSync('temp/deviceInfo.json', 'utf-8'))),
    deserializeKeystore(JSON.parse(fs.readFileSync('temp/keystore.json', 'utf-8'))),
    UrlSignProvider('http://106.54.14.24:8084/api/sign/30366'),
);

await bot.fastLogin();
console.log('User', bot.ctx.keystore.uin, 'logged in.');

export default bot;