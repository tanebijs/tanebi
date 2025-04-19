import { resolveOneBotFile } from '@app/common/download';
import { convert } from '@app/common/silk';
import { OneBotApp } from '@app/index';
import { OneBotInputMessage } from '@app/message';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import {
    AbstractMessageBuilder,
    BotContact,
    BotFriend,
    BotGroup,
    GroupMessageBuilder,
    MessageType,
    PrivateMessageBuilder,
} from 'tanebi';
import { PbSendMsg } from 'tanebi/internal/packet/message/PbSendMsg';
import { PushMsgBody } from 'tanebi/internal/packet/message/PushMsg';

export async function transformSendMessage(
    ctx: OneBotApp,
    contact: BotContact,
    b: AbstractMessageBuilder,
    segments: OneBotInputMessage['message'],
) {
    for (const segment of segments) {
        if (segment.type === 'text') {
            b.text(segment.data.text);
        } else if (segment.type === 'image') {
            const image = await resolveOneBotFile(ctx, segment.data);
            await b.image(image, segment.data.sub_type, segment.data.summary);
        } else if (segment.type === 'face') {
            b.face(segment.data.id);
        } else if (segment.type === 'at') {
            if (contact instanceof BotGroup) {
                const gb = b as GroupMessageBuilder;
                if (segment.data.qq === 'all') {
                    gb.mentionAll();
                } else {
                    const member = await contact.getMember(segment.data.qq);
                    if (!member) {
                        throw new Error(`Member ${segment.data.qq} not found in group ${contact.uin}`);
                    }
                    gb.mention(member);
                }
            } else {
                throw new Error('At segment is not supported in private messages');
            }
        } else if (segment.type === 'record') {
            const record = await resolveOneBotFile(ctx, segment.data);
            if (ctx.ntSilkBinding) {
                const { data, meta } = await convert(ctx, record);
                await b.record(data, Math.round(meta.format.duration!));
            } else {
                ctx.logger.warn('Silk conversion is disabled, sending original file, may fail');
                await b.record(record, 5);
            }
        } else if (segment.type === 'reply') {
            const message = await ctx.storage.getById(segment.data.id);
            if (!message) {
                throw new Error(`Message #${segment.data.id} not found`);
            }
            if (b instanceof GroupMessageBuilder) {
                if (message.type !== MessageType.GroupMessage || message.peerUin !== contact.uin) {
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
                        senderUin: ctx.bot.uin,
                        senderUid: ctx.bot.uid,
                        messageUid: 0n,
                        elements: body.body?.richText?.elements ?? [],
                    };
                }
            } else if (b instanceof PrivateMessageBuilder) {
                const friend = contact as BotFriend;
                if (message.type !== MessageType.PrivateMessage || message.peerUin !== friend.uin) {
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
            }
        }
    }
}
