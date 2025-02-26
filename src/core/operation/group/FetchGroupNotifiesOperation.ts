import { defineOperation } from '@/core/operation/OperationBase';
import { FetchGroupNotifies, FetchGroupNotifiesResponse } from '@/core/packet/oidb/0x10c0_1';

export const FetchGroupNotifiesOperation = defineOperation(
    'fetchGroupNotifies',
    'OidbSvcTrpcTcp.0x10c0_1',
    (ctx, count: number = 20) => Buffer.from(FetchGroupNotifies.encode({ count })),
    (ctx, payload) => FetchGroupNotifiesResponse.decodeBodyOrThrow(payload).requests,
);