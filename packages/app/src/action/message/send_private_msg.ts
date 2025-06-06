import { defineAction, Failed, Ok } from '@app/action';
import { send_poke } from '@app/action/message/send_poke';
import { send_private_forward_msg } from '@app/action/message/send_private_forward_msg';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { transformSendMessage } from '@app/message/transform/send';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { MessageType, sendBlob } from 'tanebi';
import { z } from 'zod';

export const send_private_msg = defineAction(
    'send_private_msg',
    z.object({
        user_id: zOneBotInputUin,
    }).and(zOneBotInputMessage),
    async (ctx, payload) => {
        const friend = await ctx.bot.getFriend(payload.user_id);
        if (!friend) {
            return Failed(404, 'Friend not found');
        }
        const firstSegment = payload.message[0];
        if (firstSegment.type === 'poke') {
            return send_poke.handler(ctx, {
                user_id: payload.user_id,
            });
        } else if (firstSegment.type === 'node') {
            return send_private_forward_msg.handler(ctx, {
                user_id: payload.user_id,
                messages: payload.message,
            });
        }
        const sendResult = await friend.sendMsg(b => transformSendMessage(ctx, friend, b, payload.message));
        const dbMsgId = await ctx.storage.insert({
            type: MessageType.PrivateMessage,
            createdAt: sendResult.timestamp,
            storeType: MessageStoreType.OutgoingMessageStore,
            peerUin: payload.user_id,
            sequence: sendResult.sequence,
            clientSequence: sendResult.clientSequence!,
            body: OutgoingMessageStore.encode({
                jsonElem: JSON.stringify(payload.message),
                pbElem: sendResult[sendBlob],
            }),
        });
        return Ok({ message_id: dbMsgId });
    },
);
