import { defineOperation } from '@/core/operation/OperationBase';

export type NTEasyLoginResult = {
    success: true;
    tgt: Buffer;
    d2: Buffer;
    d2Key: Buffer;
    tempPassword: Buffer;
    sessionDate: Date;
} | {
    success: false;
    errorCode: number;
    unusual?: {
        sign: Buffer;
        cookies: string;
    };
}

export const NTEasyLoginOperation = defineOperation(
    'ntEasyLogin',
    'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLogin',
    (ctx) => ctx.ntLoginLogic.buildNTLoginPacket(ctx.keystore.session.tempPassword!),
    (ctx, payload): NTEasyLoginResult => {
        const response = ctx.ntLoginLogic.decodeNTLoginPacket(payload);
        if (!response) {
            return { success: false, errorCode: 1 };
        }

        if (response.header?.error && !response.body?.credentials) {
            return {
                success: false,
                errorCode: response.header.error.errorCode ?? 1,
                unusual: {
                    sign: Buffer.from(response.body!.unusual!.sig!),
                    cookies: response.header.cookie!.cookie!,
                }
            };
        } else {
            return {
                success: true,
                tgt: Buffer.from(response.body!.credentials!.tgt!),
                d2: Buffer.from(response.body!.credentials!.d2!),
                d2Key: Buffer.from(response.body!.credentials!.d2Key!),
                tempPassword: Buffer.from(response.body!.credentials!.tempPassword!),
                sessionDate: new Date(),
            };
        }
    }
);