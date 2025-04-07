import { MessageType, sendBlob } from 'tanebi';
import { z } from 'zod';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotSendNodeSegment } from '@app/message/segment';
import { encodeForwardId, transformForwardMessages } from '@app/message/transform/forward';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';

export const send_private_forward_msg = defineAction(
    'send_private_forward_msg',
    z.object({
        user_id: zOneBotInputUin,
        messages: z.array(zOneBotSendNodeSegment).min(1),
    }),
    async (ctx, payload) => {
        const friend = await ctx.bot.getFriend(payload.user_id);
        if (!friend) {
            return Failed(404, 'Friend not found');
        }
        let resId: string | undefined;
        const sendResult = await friend.sendMsg(async (b) => {
            resId = (await b.forward(async (p) => {
                await transformForwardMessages(ctx, p, payload.messages);
            })).resId;
        });
        if (!resId) {
            return Failed(500, 'Failed to send forward message');
        }
        const dbMsgId = await ctx.storage.insert({
            type: MessageType.PrivateMessage,
            createdAt: sendResult.timestamp,
            storeType: MessageStoreType.OutgoingMessageStore,
            peerUin: payload.user_id,
            sequence: sendResult.sequence,
            clientSequence: sendResult.clientSequence,
            body: Buffer.from(OutgoingMessageStore.encode({
                jsonElem: JSON.stringify(payload.messages),
                pbElem: sendResult[sendBlob],
            })),
        });
        return Ok({
            message_id: dbMsgId,
            forward_id: encodeForwardId(ctx.bot.uid, resId),
        });
    }
);