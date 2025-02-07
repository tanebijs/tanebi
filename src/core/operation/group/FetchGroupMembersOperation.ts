import { defineOperation } from '@/core/operation/OperationBase';
import { FetchGroupMembers, FetchGroupMembersResponse } from '@/core/packet/oidb/0xfe7_3';

/**
 * This is a paginated operation to fetch friends.
 * Consider using stable API unless you know what you are doing.
 */
export const FetchGroupMembersOperation = defineOperation(
    'fetchGroupMembers',
    'OidbSvcTrpcTcp.0xfe7_3',
    (ctx, groupUin: number, token?: string) => Buffer.from(FetchGroupMembers.encode({
        groupUin,
        queried: {
            memberName: true,
            memberCard: true,
            level: true,
            joinTimestamp: true,
            lastMsgTimestamp: true,
            shutUpTimestamp: true,
            permission: true,
        },
        token,
    })),
    (ctx, payload) => FetchGroupMembersResponse.decodeBodyOrThrow(payload),
);