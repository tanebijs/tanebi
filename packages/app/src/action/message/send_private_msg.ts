import { MessageType, sendBlob } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { resolveOneBotUrl } from '@app/common/download';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { z } from 'zod';
import { PushMsgBody } from '@/internal/packet/message/PushMsg';
import { PbSendMsg } from '@/internal/packet/message/PbSendMsg';
import { convert } from '@app/common/silk';

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
            // TODO: Implement poke
        } else if (firstSegment.type === 'node') {
            // TODO: Implement send forward
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
                } else if (segment.type === 'reply') {
                    const message = await ctx.storage.getById(segment.data.id);
                    if (!message) {
                        throw new Error(`Message #${segment.data.id} not found`);
                    }
                    if (message.type !== MessageType.PrivateMessage || message.peerUin !== payload.user_id) {
                        throw new Error('Cannot reply to a message from another user');
                    }
                    if (message.storeType === MessageStoreType.PushMsgBody) {
                        const body = PushMsgBody.decode(message.body);
                        b.replyInfo = {
                            sequence: message.sequence,
                            senderUin: friend.uin,
                            senderUid: friend.uid,
                            messageUid: body.contentHead.msgUid ?? 0n,
                            elements: body.body?.richText?.elements ?? [],
                        };
                        b.repliedClientSequence = message.clientSequence!;
                    } else {
                        const body = PbSendMsg.decode(OutgoingMessageStore.decode(message.body).pbElem);
                        b.replyInfo = {
                            sequence: message.sequence,
                            senderUin: friend.uin,
                            senderUid: friend.uid,
                            messageUid: 0n,
                            elements: body.body?.richText?.elements ?? [],
                        };
                        b.repliedClientSequence = message.clientSequence!;
                    }
                } else if (segment.type === 'record') {
                    const record = await resolveOneBotUrl(segment.data.file);
                    if (ctx.config.enableNtSilk) {
                        const { data, meta } = await convert(ctx, record);
                        await b.record(data, Math.round(meta.format.duration!));
                    } else {
                        await b.record(record, 5);
                    }
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
            body: Buffer.from(
                OutgoingMessageStore.encode({
                    jsonElem: JSON.stringify(payload.message),
                    pbElem: sendResult[sendBlob],
                })
            ),
        });
        return Ok({ message_id: dbMsgId });
    }
);
