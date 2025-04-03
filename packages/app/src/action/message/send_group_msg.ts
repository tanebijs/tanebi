import { MessageType, sendBlob } from 'tanebi';
import { z } from 'zod';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { send_poke } from '@app/action/message/send_poke';
import { transformSendMessage } from '@app/message/transform';

export const send_group_msg = defineAction(
    'send_group_msg',
    z.object({
        group_id: zOneBotInputUin,
    }).and(zOneBotInputMessage),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        const firstSegment = payload.message[0];
        if (firstSegment.type === 'poke') {
            return send_poke.handler(ctx, {
                group_id: payload.group_id,
                user_id: firstSegment.data.id,
            });
        } else if (firstSegment.type === 'node') {
            // TODO: Implement send forward
        }
        const sendResult = await group.sendMsg(b => transformSendMessage(ctx, group, b, payload.message));
        const dbMsgId = await ctx.storage.insert({
            type: MessageType.GroupMessage,
            createdAt: sendResult.timestamp,
            storeType: MessageStoreType.OutgoingMessageStore,
            peerUin: payload.group_id,
            sequence: sendResult.sequence,
            clientSequence: null,
            body: Buffer.from(OutgoingMessageStore.encode({
                jsonElem: JSON.stringify(payload.message),
                pbElem: sendResult[sendBlob],
            })),
        });
        return Ok({ message_id: dbMsgId });
    }
);