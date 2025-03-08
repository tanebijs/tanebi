import { defineOperation } from '@/internal/operation/OperationBase';
import { ReactionType } from '@/internal/packet/oidb/0x9082_1';
import { RemoveGroupReaction } from '@/internal/packet/oidb/0x9082_2';

export const RemoveGroupReactionOperation = defineOperation(
    'removeGroupReaction',
    'OidbSvcTrpcTcp.0x9082_2',
    (ctx, groupUin: number, sequence: number, code: string, type: ReactionType) => Buffer.from(
        RemoveGroupReaction.encode({
            groupUin,
            sequence,
            code,
            type,
        })),
);