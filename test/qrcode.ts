import { BotContext } from '@/core';
import { randomBytes } from 'crypto';
import { UrlSignProvider } from '@/core/common/SignProvider';
import { TransEmp12_QrCodeState } from '@/core/packet/login/wtlogin/TransEmp12';

const ctx = new BotContext(
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
await ctx.networkLogic.connectToMsfServer();

const qrCodeInfo = await ctx.ops.call('fetchQrCode');
console.log(qrCodeInfo);

ctx.keystore.session.qrString = qrCodeInfo.qrSig;
ctx.keystore.session.qrSign = qrCodeInfo.signature;
ctx.keystore.session.qrUrl = qrCodeInfo.url;

const qrCodeResult = await new Promise<{
    tempPassword: Buffer,
    noPicSig: Buffer,
    tgtgtKey: Buffer,
}>((resolve, reject) => {
    const qrCodeResultLoop = setInterval(async () => {
        const res = await ctx.ops.call('queryQrCodeResult');
        if (res.confirmed) {
            clearInterval(qrCodeResultLoop);
            resolve({
                tempPassword: res.tempPassword,
                noPicSig: res.noPicSig,
                tgtgtKey: res.tgtgtKey,
            });
        } else {
            if (res.state === TransEmp12_QrCodeState.CodeExpired || res.state === TransEmp12_QrCodeState.Canceled) {
                clearInterval(qrCodeResultLoop);
                reject(new Error('Session expired or cancelled'));
            }
        }
    }, 2000);
});
console.log(qrCodeResult);

ctx.keystore.session.tempPassword = qrCodeResult.tempPassword;
ctx.keystore.session.noPicSig = qrCodeResult.noPicSig;
ctx.keystore.stub.tgtgtKey = qrCodeResult.tgtgtKey;

ctx.keystore.uin = await ctx.wtLoginLogic.getCorrectUin();
console.log(ctx.keystore.uin, 'trying to login');

const loginResult = await ctx.ops.call('wtLogin');
console.log(loginResult);

if (loginResult.success) {
    ctx.keystore.uid = loginResult.uid;

    ctx.keystore.session.d2Key = loginResult.session.d2Key;
    ctx.keystore.session.tgt = loginResult.session.tgt;
    ctx.keystore.session.d2 = loginResult.session.d2;
    ctx.keystore.session.tempPassword = loginResult.session.tempPassword;
    ctx.keystore.session.sessionDate = loginResult.session.sessionDate;

    ctx.keystore.info = loginResult.info;
}