import { defineOperation } from '@/core/operation/OperationBase';
import {
    IncomingTransEmp12,
    IncomingTransEmp12_Confirmed, IncomingTransEmp12_Confirmed_TlvPack,
    TransEmp12_QrCodeState,
} from '@/core/packet/login/wtlogin/TransEmp12';
import { SmartBuffer } from 'smart-buffer';

export const QueryQrCodeResultSubCommand = 0x12;

export const QueryQrCodeResultOperation = defineOperation(
    'queryQrCodeResult',
    'wtlogin.trans_emp',
    (ctx) => ctx.wtLoginLogic.buildWtLoginPacket(
        'wtlogin.trans_emp',
        ctx.wtLoginLogic.buildTransEmpBody(QueryQrCodeResultSubCommand, new SmartBuffer()
            .writeUInt32BE(ctx.appInfo.AppId)
            .writeUInt16BE(ctx.keystore.session.qrSign!.length)
            .writeBuffer(ctx.keystore.session.qrSign!)
            .writeBigUInt64BE(BigInt(ctx.keystore.uin))
            .writeUInt32BE(0)
            .writeUInt8(0)
            .writeUInt8(0x03)
            .toBuffer()
        )),
    (ctx, payload) => {
        const resolvedWtLogin = ctx.wtLoginLogic.decodeWtLoginPacket(payload);
        if (resolvedWtLogin.commandId !== 2066) {
            throw new Error(`Unexpected command id: ${resolvedWtLogin.commandId}`);
        }
        const resolvedTransEmp = ctx.wtLoginLogic.unwrapTransEmpPacket(resolvedWtLogin.decrypted);
        if (resolvedTransEmp.subCommand !== QueryQrCodeResultSubCommand) {
            throw new Error(`Unexpected sub command: ${resolvedTransEmp.subCommand}`);
        }
        const transEmp12 = IncomingTransEmp12.decode(resolvedTransEmp.data);
        if (transEmp12.qrCodeState === TransEmp12_QrCodeState.Confirmed) {
            const { tlvPack } = IncomingTransEmp12_Confirmed.decode(transEmp12.remaining);
            const resolvedTlvPack = IncomingTransEmp12_Confirmed_TlvPack.unpack(tlvPack);
            return {
                state: TransEmp12_QrCodeState.Confirmed,
                tempPassword: resolvedTlvPack['0x18']!.tempPassword,
                noPicSig: resolvedTlvPack['0x19']!.noPicSig,
                tgtgtKey: resolvedTlvPack['0x1e']!.tgtgtKey,
            };
        } else {
            return {
                state: transEmp12.qrCodeState,
            };
        }
    }
);