import { Keystore } from '@/core/common/Keystore';
import { BotContext } from '@/core';
import * as fs from 'node:fs';
import { DeviceInfo } from '@/core/common/DeviceInfo';
import { UrlSignProvider } from '@/app/util';

type BufferSerialized = {
    type: 'Buffer';
    data: number[];
}

type DeviceInfoSerialized = {
    guid: BufferSerialized;
    macAddress: BufferSerialized;
    deviceName: string;
    systemKernel: string;
    kernelVersion: string;
}

type KeystoreSerialized = {
    uin: number;
    uid?: string;
    passwordMd5: string;
    stub: {
        randomKey: BufferSerialized;
        tgtgtKey: BufferSerialized;
    };
    session: {
        d2Key: BufferSerialized;
        d2: BufferSerialized;
        tgt: BufferSerialized;
        sessionDate: Date;
        qrSign?: BufferSerialized;
        qrString?: string;
        qrUrl?: string;
        exchangeKey?: BufferSerialized;
        keySign?: BufferSerialized;
        unusualSign?: BufferSerialized;
        unusualCookies?: string;
        captchaUrl?: string;
        newDeviceVerifyUrl?: string;
        captcha?: [string, string, string];
        tempPassword?: BufferSerialized;
        noPicSig?: BufferSerialized;
        sequence: number;
    };
    info: {
        age: number;
        gender: number;
        name: string;
    };
}

function deserializeBuffer(data?: BufferSerialized) {
    return data ? Buffer.from(data.data) : undefined;
}

function deserializeDeviceInfo(data: DeviceInfoSerialized): DeviceInfo {
    return {
        guid: deserializeBuffer(data.guid)!,
        macAddress: deserializeBuffer(data.macAddress)!,
        deviceName: data.deviceName,
        systemKernel: data.systemKernel,
        kernelVersion: data.kernelVersion,
    };
}

function deserializeKeystore(data: KeystoreSerialized): Keystore {
    return {
        uin: data.uin,
        uid: data.uid,
        passwordMd5: data.passwordMd5,
        stub: {
            randomKey: deserializeBuffer(data.stub.randomKey)!,
            tgtgtKey: deserializeBuffer(data.stub.tgtgtKey)!,
        },
        session: {
            d2Key: deserializeBuffer(data.session.d2Key)!,
            d2: deserializeBuffer(data.session.d2)!,
            tgt: deserializeBuffer(data.session.tgt)!,
            sessionDate: data.session.sessionDate,
            qrSign: deserializeBuffer(data.session.qrSign),
            qrString: data.session.qrString,
            qrUrl: data.session.qrUrl,
            exchangeKey: deserializeBuffer(data.session.exchangeKey),
            keySign: deserializeBuffer(data.session.keySign),
            unusualSign: deserializeBuffer(data.session.unusualSign),
            unusualCookies: data.session.unusualCookies,
            captchaUrl: data.session.captchaUrl,
            newDeviceVerifyUrl: data.session.newDeviceVerifyUrl,
            captcha: data.session.captcha,
            tempPassword: deserializeBuffer(data.session.tempPassword),
            noPicSig: deserializeBuffer(data.session.noPicSig),
            sequence: data.session.sequence,
        },
        info: {
            age: data.info.age,
            gender: data.info.gender,
            name: data.info.name,
        },
    };
}

const ctx = new BotContext(
    JSON.parse(fs.readFileSync('temp/appInfo.json').toString()),
    JSON.parse(fs.readFileSync('temp/coreConfig.json').toString()),
    deserializeDeviceInfo(JSON.parse(fs.readFileSync('temp/deviceInfo.json').toString())),
    deserializeKeystore(JSON.parse(fs.readFileSync('temp/keystore.json').toString())),
    UrlSignProvider('http://106.54.14.24:8084/api/sign/30366'),
);

await ctx.networkLogic.connectToMsfServer();
console.log(await ctx.ops.call('botOnline'));

ctx.events.on('messagePush', ({
    message: {
        responseHead: { fromUin, toUin },
        body,
    }
}) => {
    const message = body?.richText?.elements?.find(e => e.text)?.text?.str ?? '(non-text message)';
    console.log(`Msg(${fromUin} -> ${toUin}): ${message}`);
});