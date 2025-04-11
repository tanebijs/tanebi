import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchUserInfoByUid, FetchUserInfoByUin, FetchUserInfoResponse } from '@/internal/packet/oidb/0xfe1_2';

export const FetchUserInfoOperation = defineOperation(
    'fetchUserInfo',
    'OidbSvcTrpcTcp.0xfe1_2',
    (ctx, uinOrUid: number | string, keys: Array<number> = [105]) =>
        typeof uinOrUid === 'string' ?
            FetchUserInfoByUid.encode({ uid: uinOrUid, keys: keys.map(key => ({ key })) }) :
            FetchUserInfoByUin.encode({ uin: uinOrUid, keys: keys.map(key => ({ key })) }),
    (ctx, payload) => FetchUserInfoResponse.decodeBodyOrThrow(payload), // TODO: extract properties
);