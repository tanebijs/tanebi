import { blob, GroupMemberPermission, MessageType, rawMessage } from 'tanebi';
import { OneBotPrivateMessageEvent, OneBotGroupMessageEvent } from '@app/event/message';
import { OneBotApp } from '@app/index';
import { transformRecvMessage } from '@app/message/transform/recv';
import { MessageStoreType } from '@app/storage/types';

export function installMessageHandler(ctx: OneBotApp) {
    ctx.bot.onPrivateMessage(async (friend, message) => {
        if (message.isSelf && !ctx.config.reportSelfMessage) {
            return;
        }
        try {
            const id = await ctx.storage.insert({
                createdAt: Math.round(Date.now() / 1000),
                storeType: MessageStoreType.PushMsgBody,
                type: MessageType.PrivateMessage,
                peerUin: friend.uin,
                sequence: message.sequence,
                clientSequence: message[rawMessage].clientSequence,
                body: message[rawMessage][blob],
            });
            const recvMessage = await transformRecvMessage(
                ctx,
                MessageType.PrivateMessage,
                friend.uin,
                message,
                message.repliedSequence
            );
            await ctx.dispatchEvent(new OneBotPrivateMessageEvent(
                ctx,
                id,
                friend.uin,
                message.content.toPreviewString(),
                12, // TODO: Get font info
                recvMessage,
                'friend',
                {
                    user_id: friend.uin,
                    nickname: message[rawMessage].senderName,
                    sex: '', // TODO: Get gender from friend indo
                    age: 0, // TODO: Get age from friend info
                }
            ));
        } catch (e) {
            ctx.logger.error(`Failed to process message: ${e}`);
        }
    });
    
    ctx.bot.onGroupMessage(async (group, sender, message) => {
        if (sender.uin === ctx.bot.uin && !ctx.config.reportSelfMessage) {
            return;
        }
        try {
            const id = await ctx.storage.insert({
                createdAt: Math.round(Date.now() / 1000),
                storeType: MessageStoreType.PushMsgBody,
                type: MessageType.GroupMessage,
                peerUin: group.uin,
                sequence: message.sequence,
                clientSequence: null,
                body: message[rawMessage][blob],
            });
            const recvMessage = await transformRecvMessage(
                ctx,
                MessageType.GroupMessage,
                group.uin,
                message,
                message.repliedSequence
            );
            await ctx.dispatchEvent(new OneBotGroupMessageEvent(
                ctx,
                id,
                sender.uin,
                message.content.toPreviewString(),
                12, // TODO: Get font info
                recvMessage,
                'normal',
                group.uin,
                {
                    user_id: sender.uin,
                    nickname: message[rawMessage].senderName,
                    card: sender.card ?? '',
                    area: '', // TODO: Get area from member info
                    level: '', // TODO: Get level from member info
                    role: sender.permission === GroupMemberPermission.Owner ? 'owner' :
                        sender.permission === GroupMemberPermission.Admin ? 'admin' : 'member',
                    title: sender.specialTitle ?? '',
                    sex: '', // TODO: Get gender from member indo
                    age: 0, // TODO: Get age from member info
                },
            ));
        } catch (e) {
            ctx.logger.error(`Failed to process message: ${e}`);
        }
    });
}