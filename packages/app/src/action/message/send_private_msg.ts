import { MessageType, sendBlob } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { resolveOneBotUrl } from '@app/common/download';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
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
        const sendResult = await friend.sendMsg(async (b) => {
            for (const segment of payload.message) {
                if (segment.type === 'text') {
                    b.text(segment.data.text);
                } else if (segment.type === 'image') {
                    const image = await resolveOneBotUrl(segment.data.file);
                    await b.image(image, segment.data.sub_type, segment.data.summary);
                } else if (segment.type === 'face') {
                    b.face(segment.data.id);
                } else if (segment.type === 'at') {
                    throw new Error('At segment is not supported in private messages');
                }
            }
        });
        const dbMsgId = await ctx.storage.insert({
            type: MessageType.PrivateMessage,
            createdAt: sendResult.timestamp,
            storeType: MessageStoreType.OutgoingMessageStore,
            peerUin: payload.user_id,
            sequence: sendResult.sequence,
            clientSequence: sendResult.clientSequence!,
            body: Buffer.from(OutgoingMessageStore.encode({
                jsonElem: JSON.stringify(payload.message),
                pbElem: sendResult[sendBlob],
            })),
        });
        return Ok({ message_id: dbMsgId });
    }
);