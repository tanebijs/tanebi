import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGroupRecallMsg } from '@/internal/packet/message/action/SsoGroupRecallMsg';

export const RecallGroupMessageOperation = defineOperation(
    'recallGroupMessage',
    'trpc.msg.msg_svc.MsgService.SsoGroupRecallMsg',
    (ctx, groupUin: number, sequence: number) =>
        Buffer.from(SsoGroupRecallMsg.encode({
            type: 1,
            groupUin,
            info: { sequence },
        })),
);