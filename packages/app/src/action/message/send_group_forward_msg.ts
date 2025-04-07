import { MessageType, sendBlob } from 'tanebi';
import { z } from 'zod';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotSendNodeSegment } from '@app/message/segment';
import { encodeForwardId, transformForwardMessages } from '@app/message/transform/forward';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';

export const send_group_forward_msg = defineAction(
    'send_group_forward_msg',
    z.object({
        group_id: zOneBotInputUin,
        messages: z.array(zOneBotSendNodeSegment).min(1),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        let resId: string | undefined;
        const sendResult = await group.sendMsg(async (b) => {
            resId = (await b.forward(async (p) => {
                await transformForwardMessages(ctx, p, payload.messages);
            })).resId;
        });
        if (!resId) {
            return Failed(500, 'Failed to send forward message');
        }
        const dbMsgId = await ctx.storage.insert({
            type: MessageType.GroupMessage,
            createdAt: sendResult.timestamp,
            storeType: MessageStoreType.OutgoingMessageStore,
            peerUin: payload.group_id,
            sequence: sendResult.sequence,
            clientSequence: null,
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
