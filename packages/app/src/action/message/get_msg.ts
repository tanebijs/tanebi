import { dispatcher, MessageType, parsePushMsgBody, UserInfoGender } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputMessageId } from '@app/common/types';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { z } from 'zod';
import { encodeCQCode } from '@app/message/cqcode';
import { transformRecvMessage } from '@app/message/transform/recv';

export const get_msg = defineAction(
    'get_msg',
    z.object({
        message_id: zOneBotInputMessageId,
    }),
    async (ctx, payload) => {
        const message = await ctx.storage.getById(payload.message_id);
        if (!message) {
            return Failed(404, 'Message not found');
        }
        if (message.storeType === MessageStoreType.OutgoingMessageStore) {
            const json = JSON.parse(OutgoingMessageStore.decode(message.body).jsonElem);
            return Ok({
                time: message.createdAt,
                message_type: message.type === MessageType.PrivateMessage ? 'private' : 'group',
                message_id: message.id,
                real_id: message.id,
                sender: {
                    user_id: ctx.bot.uin,
                    nickname: ctx.bot.name,
                    sex: ctx.bot.gender === UserInfoGender.Male ? 'male' :
                        ctx.bot.gender === UserInfoGender.Female ? 'female' : 'unknown',
                    age: ctx.bot.age,
                },
                message: ctx.config.messageReportType === 'array' ? json : json.map(encodeCQCode).join(''),
            });
        } else {
            const restored = parsePushMsgBody(message.body);
            const contact = await ctx.bot[dispatcher].resolveContact(restored);
            if (!contact) {
                return Failed(404, 'Contact not found');
            }
            const dispatched = await ctx.bot[dispatcher].create(restored, contact);
            if (!dispatched) {
                return Failed(404, 'Message type not supported');
            }
            const transformed = await transformRecvMessage(
                ctx,
                message.type,
                message.peerUin,
                dispatched,
                restored.repliedSequence
            );
            return Ok({
                time: message.createdAt,
                message_type: message.type === MessageType.PrivateMessage ? 'private' : 'group',
                message_id: message.id,
                real_id: message.id,
                sender: {
                    user_id: restored.senderUin,
                    nickname: restored.senderName,
                    sex: 'unknown',
                    age: 0,
                },
                message:
                    ctx.config.messageReportType === 'array' ? transformed : transformed.map(encodeCQCode).join(''),
            });
        }
    }
);
