import { Bot } from '@/app';
import { randomBytes } from 'node:crypto';
import { UrlSignProvider } from '@/app/util';
import * as fs from 'node:fs';

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
    {
        guid: Buffer.from('030201000504070608090A0B0C0D0E0F', 'hex'),
        macAddress: Buffer.from('010203040506', 'hex'),
        deviceName: 'LagrangeTS-0abcde',
        systemKernel: 'Windows 10.0.19042',
        kernelVersion: '10.0.19042.0',
    },
    {
        uin: 0,
        passwordMd5: '',
        stub: {
            randomKey: randomBytes(16),
            tgtgtKey: Buffer.alloc(16),
        },
        session: {
            d2Key: Buffer.alloc(16),
            d2: Buffer.alloc(0),
            tgt: Buffer.alloc(0),
            sessionDate: new Date(),
            sequence: 0,
        },
        info: {
            age: 0,
            gender: 0,
            name: '',
        },
    },
    UrlSignProvider('http://106.54.14.24:8084/api/sign/30366'),
);

if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
}

await bot.qrCodeLogin((url, png) => {
    fs.writeFileSync('temp/qrcode.png', png);
    console.log('QR code png saved to temp/qrcode.png');
    console.log('QR code url:', url);
});

console.log('User', bot.ctx.keystore.uin, 'logged in.');