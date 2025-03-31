import { MessageType, sendBlob } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { resolveOneBotUrl } from '@app/common/download';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { z } from 'zod';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { PushMsgBody } from '@/internal/packet/message/PushMsg';
import { PbSendMsg } from '@/internal/packet/message/PbSendMsg';

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
        const sendResult = await group.sendMsg(async (b) => {
            for (const segment of payload.message) {
                if (segment.type === 'text') {
                    b.text(segment.data.text);
                } else if (segment.type === 'image') {
                    const image = await resolveOneBotUrl(segment.data.file);
                    await b.image(image, segment.data.sub_type, segment.data.summary);
                } else if (segment.type === 'face') {
                    b.face(segment.data.id);
                } else if (segment.type === 'at') {
                    if (segment.data.qq === 'all') {
                        b.mentionAll();
                    } else {
                        const member = await group.getMember(segment.data.qq);
                        if (!member) {
                            throw new Error(`Member ${segment.data.qq} not found in group ${payload.group_id}`);
                        }
                        b.mention(member);
                    }
                } else if (segment.type === 'reply') {
                    const message = await ctx.storage.getById(segment.data.id);
                    if (!message) {
                        throw new Error(`Message #${segment.data.id} not found`);
                    }
                    if (message.type !== MessageType.GroupMessage || message.peerUin !== payload.group_id) {
                        throw new Error('Cannot reply to a message from another group');
                    }
                    if (message.storeType === MessageStoreType.PushMsgBody) {
                        const body = PushMsgBody.decode(message.body);
                        b.replyInfo = {
                            sequence: message.sequence,
                            senderUin: body.responseHead.fromUin,
                            senderUid: body.responseHead.fromUid ?? '',
                            messageUid: body.contentHead.msgUid ?? 0n,
                            elements: body.body?.richText?.elements ?? [],
                        };
                    } else {
                        const body = PbSendMsg.decode(OutgoingMessageStore.decode(message.body).pbElem);
                        b.replyInfo = {
                            sequence: message.sequence,
                            senderUin: ctx.bot.uin!,
                            senderUid: ctx.bot.uid,
                            messageUid: 0n,
                            elements: body.body?.richText?.elements ?? [],
                        };
                    }
                }
            }
        });
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