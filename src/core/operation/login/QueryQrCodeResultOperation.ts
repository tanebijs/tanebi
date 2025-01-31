import { defineOperation } from '@/core/operation/OperationBase';
import {
    IncomingTransEmp12,
    IncomingTransEmp12_Confirmed, IncomingTransEmp12_Confirmed_TlvPack,
    OutgoingTransEmp12,
    TransEmp12_QrCodeState,
} from '@/core/packet/login/wtlogin/TransEmp12';
import { BUF0 } from '@/core/util/constants';

export const QueryQrCodeResultSubCommand = 0x12;

export const QueryQrCodeResultOperation = defineOperation(
    'queryQrCodeResult',
    'wtlogin.trans_emp',
    (ctx) => ctx.wtLoginLogic.buildWtLoginPacket(
        'wtlogin.trans_emp',
        ctx.wtLoginLogic.buildTransEmpBody(QueryQrCodeResultSubCommand, OutgoingTransEmp12.encode({
            field0: 0,
            appId: ctx.appInfo.AppId,
            qrSign: ctx.keystore.session.qrSign!,
            uin: 0n,
            version: 0,
            field5: BUF0,
            field6: 0,
        }))),
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