import { defineOperation } from '@/core/operation/OperationBase';
import {
    IncomingWtLogin,
    IncomingWtLogin_TlvPack,
    OutgoingWtLogin,
    WtLoginState,
} from '@/core/packet/login/wtlogin/WtLogin';
import { TlvLogin0x16e } from '@/core/packet/login/wtlogin/login/0x16e';
import { TlvLogin0x147 } from '@/core/packet/login/wtlogin/login/0x147';
import { TlvLogin0x128 } from '@/core/packet/login/wtlogin/login/0x128';
import { BUF0 } from '@/core/util/constants';
import { Keystore } from '@/core/common/Keystore';
import { TlvLogin0x119_DecryptedPack } from '@/core/packet/login/wtlogin/login/0x119';
import { decryptTea } from '@/core/util/crypto/tea';
import { TlvLogin0x543Body } from '@/core/packet/login/wtlogin/login/0x543';

const BUF12 = Buffer.alloc(12);

export type WtLoginCallResult = {
    state: WtLoginState.Success,
    uid: string,
    session: {
        d2Key: Buffer,
        tgt: Buffer,
        d2: Buffer,
        tempPassword: Buffer,
        sessionDate: Date,
    },
    info: Keystore['info'],
} | {
    state: Exclude<WtLoginState, WtLoginState.Success>,
    tag?: string,
    message?: string,
};

export const WtLoginOperation = defineOperation(
    'wtLogin',
    'wtlogin.login',
    (ctx) => ctx.wtLoginLogic
        .buildWtLoginPacket('wtlogin.login', OutgoingWtLogin.pack({
            '0x106': { tempPassword: ctx.keystore.session.tempPassword! },
            '0x144': {
                tlvCount: 4,
                tlv_0x16e: TlvLogin0x16e.encode({ deviceName: ctx.deviceInfo.deviceName }),
                tlv_0x147: TlvLogin0x147.encode({
                    appId: ctx.appInfo.AppId,
                    ptVersion: ctx.appInfo.PtVersion,
                    packageName: ctx.appInfo.PackageName,
                }),
                tlv_0x128: TlvLogin0x128.encode({
                    field0: 0,
                    guidNew: 0,
                    guidAvailable: 0,
                    guidChanged: 0,
                    guidFlag: 0,
                    os: ctx.appInfo.Os,
                    guid: ctx.deviceInfo.guid,
                    field7: 0,
                }),
                tlv_0x124: BUF12,
            },
            '0x116': {
                version: 0,
                miscBitmap: ctx.appInfo.MiscBitmap,
                subSigMap: ctx.appInfo.SubSigMap,
                appIdCount: 0,
                appIdBytes: BUF0,
            },
            '0x142': {
                version: 0,
                packageName: ctx.appInfo.PackageName,
            },
            '0x145': { guid: ctx.deviceInfo.guid },
            '0x018': {
                pingVersion: 0,
                ssoVersion: 5,
                field2: 0,
                appClientVersion: 8001,
                uin: ctx.keystore.uin,
                field5: 0,
                field6: 0,
            },
            '0x141': {
                version: 0,
                field1: 'Unknown',
                networkType: 0,
                apn: '',
            },
            '0x177': {
                field0: 1,
                buildTime: 0,
                wtLoginSdk: ctx.appInfo.WtLoginSdk,
            },
            '0x191': { k: 0 },
            '0x100': {
                dbBufVersion: 0,
                ssoVersion: 5,
                appId: ctx.appInfo.AppId,
                subAppId: ctx.appInfo.SubAppId,
                appClientVersion: ctx.appInfo.AppClientVersion,
                mainSigMap: ctx.appInfo.MainSigMap,
            },
            '0x107': {
                picType: 1,
                capType: 0x0d,
                picSize: 0,
                retType: 1,
            },
            '0x318': {},
            '0x16a': { noPicSig: ctx.keystore.session.noPicSig! },
            '0x166': { imageType: 5 },
            '0x521': {
                productType: 0x13,
                productDesc: 'basicim',
            },
        })),
    function (ctx, data): WtLoginCallResult {
        const { commandId, decrypted } = ctx.wtLoginLogic.decodeWtLoginPacket(data);
        if (commandId !== 2064) {
            throw new Error(`Unexpected command id: ${commandId}`);
        }
        const { state, tlvPack: tlvPackEncoded } = IncomingWtLogin.decode(decrypted);
        const unpacked = IncomingWtLogin_TlvPack.unpack(tlvPackEncoded);
        if (state === WtLoginState.Success) {
            const unpacked0x119 = TlvLogin0x119_DecryptedPack.unpack(
                decryptTea(unpacked['0x119']!.encryptedTlv, ctx.keystore.stub.tgtgtKey));
            return {
                state: WtLoginState.Success,
                uid: TlvLogin0x543Body.decode(unpacked0x119['0x543']!.protoBody).layer1.layer2.uid,
                session: {
                    d2Key: unpacked0x119['0x305']!.d2Key,
                    tgt: unpacked0x119['0x10a']!.tgt,
                    d2: unpacked0x119['0x143']!.d2,
                    tempPassword: unpacked0x119['0x106']!.tempPassword,
                    sessionDate: new Date(),
                },
                info: {
                    age: unpacked0x119['0x11a']!.age,
                    gender: unpacked0x119['0x11a']!.gender,
                    name: unpacked0x119['0x11a']!.nickname,
                }
            };
        } else {
            return {
                state,
                tag: unpacked['0x146']?.tag,
                message: unpacked['0x146']?.message,
            };
        }
    },
);