import { defineOperation } from '@/core/operation/OperationBase';
import { SendGrayTipPoke } from '@/core/packet/oidb/0xed3_1';

export const SendGrayTipPokeOperation = defineOperation(
    'sendGrayTipPoke',
    'OidbSvcTrpcTcp.0xed3_1',
    (ctx, uin: number, groupUin?: number, friendUin?: number) =>
        Buffer.from(SendGrayTipPoke.encode({
            uin,
            groupUin,
            friendUin,
            ext: 0,
        })),
);