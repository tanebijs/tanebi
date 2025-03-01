import { defineOperation } from '@/core/operation/OperationBase';
import { SetMemberSpecialTitle } from '@/core/packet/oidb/0x8fc_2';

export const SetMemberSpecialTitleOperation = defineOperation(
    'setMemberSpecialTitle',
    'OidbSvcTrpcTcp.0x8fc_2',
    (ctx, groupUin: number, targetUid: string, specialTitle: string,) => Buffer.from(
        SetMemberSpecialTitle.encode({
            groupUin,
            body: {
                targetUid,
                specialTitle,
                expireTime: -1,
                specialTitle2: specialTitle,
            }
        })),
);