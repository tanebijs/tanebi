import { defineOperation } from '@/internal/operation/OperationBase';
import { SetMemberSpecialTitle } from '@/internal/packet/oidb/0x8fc_2';

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