import { BotContext } from '@/core';
import { randomBytes } from 'crypto';
import { UrlSignProvider } from '@/core/common/SignProvider';
import { TransEmpSubCommand } from '@/core/operation/login/TransEmpOperation';

async function main() {
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
    console.log(await ctx.ops.call('transEmp', TransEmpSubCommand.FetchQrCode));
}

main();