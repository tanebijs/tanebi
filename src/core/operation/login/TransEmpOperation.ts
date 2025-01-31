import { defineOperation } from '@/core/operation/OperationBase';
import {
    IncomingTransEmp31,
    IncomingTransEmp31_TlvPack,
    OutgoingTransEmp31,
    OutgoingTransEmp31_TlvPack,
} from '@/core/packet/login/wtlogin/TransEmp31';
import { TlvQrCode0x0d1_Response, TlvQrCode0x0d1Body } from '@/core/packet/login/wtlogin/qrcode/0x0d1';
import {
    IncomingTransEmp12,
    IncomingTransEmp12_Confirmed,
    IncomingTransEmp12_Confirmed_TlvPack,
    OutgoingTransEmp12,
    TransEmp12_QrCodeState,
} from '@/core/packet/login/wtlogin/TransEmp12';
import { BUF0 } from '@/core/util/constants';

export enum TransEmpSubCommand {
    FetchQrCode = 0x31,
    QueryQrCodeResult = 0x12,
}

export type TransEmpCallResult = {
    command: TransEmpSubCommand.FetchQrCode;
    qrCode: Buffer;
    expiration: number;
    url: string;
    qrSig: string;
    signature: Buffer;
} | ({
    command: TransEmpSubCommand.QueryQrCodeResult;
} & ({
    state: Exclude<TransEmp12_QrCodeState, TransEmp12_QrCodeState.Confirmed>;
} | {
    state: TransEmp12_QrCodeState.Confirmed;
    tempPassword: Buffer;
    noPicSig: Buffer;
    tgtgtKey: Buffer;
}));

const BUF_0x30_0x01 = Buffer.from([0x30, 0x01]);

export const TransEmpOperation = defineOperation(
    'transEmp',
    'wtlogin.trans_emp',
    (ctx, state: TransEmpSubCommand) => {
        let body: Buffer;
        if (state === TransEmpSubCommand.FetchQrCode) {
            body = ctx.wtLoginLogic.buildTransEmpBody(
                TransEmpSubCommand.FetchQrCode,
                OutgoingTransEmp31.encode({
                    appId: ctx.appInfo.AppId,
                    uin: BigInt(ctx.keystore.uin),
                    tgt: ctx.keystore.session.tgt,
                    field4: 0,
                    field5: 0,
                    tlvPack: OutgoingTransEmp31_TlvPack.pack({
                        '0x16': {
                            field0: 0,
                            appId: ctx.appInfo.AppId,
                            appIdQrCode: ctx.appInfo.SubAppId,
                            guid: ctx.deviceInfo.guid,
                            packageName: ctx.appInfo.PackageName,
                            ptVersion: ctx.appInfo.PtVersion,
                            packageName2: ctx.appInfo.PackageName,
                        },
                        '0x1b': {
                            micro: 0,
                            version: 0,
                            size: 3,
                            margin: 4,
                            dpi: 72,
                            ecLevel: 2,
                            hint: 2,
                            field7: 0,
                        },
                        '0x1d': {
                            field0: 1,
                            miscBitmap: ctx.appInfo.MainSigMap,
                            field2: 0,
                            field3: 0,
                        },
                        '0x33': { guid: ctx.deviceInfo.guid },
                        '0x35': { ptOsVersion: ctx.appInfo.SsoVersion },
                        '0x66': { ptOsVersion: ctx.appInfo.SsoVersion },
                        '0xd1': {
                            body: Buffer.from(TlvQrCode0x0d1Body.encode({
                                system: {
                                    os: ctx.appInfo.Os,
                                    name: ctx.deviceInfo.deviceName,
                                },
                                type: BUF_0x30_0x01,
                            })),
                        },
                    }),
                })
            );
        } else {
            body = ctx.wtLoginLogic.buildTransEmpBody(0x12, OutgoingTransEmp12.encode({
                field0: 0,
                appId: ctx.appInfo.AppId,
                qrSign: ctx.keystore.session.qrSign!,
                uin: 0n,
                version: 0,
                field5: BUF0,
                field6: 0,
            }));
        }
        return ctx.wtLoginLogic.buildWtLoginPacket('wtlogin.trans_emp', body);
    },
    function(ctx, data): TransEmpCallResult {
        const resolvedWtLogin = ctx.wtLoginLogic.decodeWtLoginPacket(data);
        if (resolvedWtLogin.commandId !== 2066) {
            throw new Error(`Unexpected command id: ${resolvedWtLogin.commandId}`);
        }
        const resolvedTransEmp = ctx.wtLoginLogic.unwrapTransEmpPacket(resolvedWtLogin.decrypted);
        if (resolvedTransEmp.subCommand === TransEmpSubCommand.FetchQrCode) {
            const transEmp31 = IncomingTransEmp31.decode(resolvedTransEmp.data);
            const tlvPack = IncomingTransEmp31_TlvPack.unpack(transEmp31.tlvPack);
            const tlvQrCode0xd1Resp = TlvQrCode0x0d1_Response.decode(tlvPack['0xd1']!.body);
            return {
                command: TransEmpSubCommand.FetchQrCode,
                qrCode: tlvPack['0x17']!.qrCode,
                expiration: tlvPack['0x1c']!.expirationInSec,
                url: tlvQrCode0xd1Resp.url,
                qrSig: tlvQrCode0xd1Resp.qrSig,
                signature: transEmp31.signature,
            };
        } else if (resolvedTransEmp.subCommand === TransEmpSubCommand.QueryQrCodeResult) {
            const transEmp12 = IncomingTransEmp12.decode(resolvedTransEmp.data);
            if (transEmp12.qrCodeState === TransEmp12_QrCodeState.Confirmed) {
                const { tlvPack } = IncomingTransEmp12_Confirmed.decode(transEmp12.remaining);
                const resolvedTlvPack = IncomingTransEmp12_Confirmed_TlvPack.unpack(tlvPack);
                return {
                    command: TransEmpSubCommand.QueryQrCodeResult,
                    state: transEmp12.qrCodeState,
                    tempPassword: resolvedTlvPack['0x18']!.tempPassword,
                    noPicSig: resolvedTlvPack['0x19']!.noPicSig,
                    tgtgtKey: resolvedTlvPack['0x1e']!.tgtgtKey,
                };
            } else {
                return {
                    command: TransEmpSubCommand.QueryQrCodeResult,
                    state: transEmp12.qrCodeState,
                };
            }
        } else {
            throw new Error(`Unexpected sub command: ${resolvedTransEmp.subCommand}`);
        }
    },
);
