import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';
import { MessageStoreType } from '@app/storage/types';
import { IncreaseType, MessageType, parsePushMsgBody } from 'tanebi';

export abstract class OneBotNoticeEvent extends OneBotEvent {
    constructor(app: OneBotApp, readonly notice_type: string) {
        super(app, 'notice');
    }
}

export class OneBotGroupAdminNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly sub_type: 'set' | 'unset',
    ) {
        super(app, 'group_admin');
    }
}

export class OneBotGroupDecreaseNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly operator_id: number,
        readonly sub_type: 'leave' | 'kick' | 'kick_me',
    ) {
        super(app, 'group_decrease');
    }
}

export class OneBotGroupIncreaseNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly operator_id: number,
        readonly sub_type: 'invite' | 'approve',
    ) {
        super(app, 'group_increase');
    }
}

export class OneBotGroupBanNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly operator_id: number,
        readonly duration: number,
        readonly sub_type: 'ban' | 'lift',
    ) {
        super(app, 'group_ban');
    }
}

export class OneBotFriendAddNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly user_id: number,
        readonly operator_id: number,
        readonly sub_type: 'add' | 'approve',
    ) {
        super(app, 'friend_add');
    }
}

export class OneBotGroupRecallNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly operator_id: number,
        readonly message_id: number,
    ) {
        super(app, 'group_recall');
    }
}

export class OneBotFriendRecallNoticeEvent extends OneBotNoticeEvent {
    constructor(
        app: OneBotApp,
        readonly user_id: number,
        readonly operator_id: number,
        readonly message_id: number,
    ) {
        super(app, 'friend_recall');
    }
}

export abstract class OneBotNotifyEvent extends OneBotNoticeEvent {
    constructor(app: OneBotApp, readonly sub_type: string) {
        super(app, 'notify');
    }
}

export class OneBotPokeNoticeEvent extends OneBotNotifyEvent {
    constructor(
        app: OneBotApp,
        readonly group_id: number,
        readonly user_id: number,
        readonly target_id: number,
    ) {
        super(app, 'poke');
    }
}

export function installNoticeEventHandler(ctx: OneBotApp) {
    ctx.bot.onGroupAdminChange((group, member, isPromote) => {
        ctx.dispatchEvent(
            new OneBotGroupAdminNoticeEvent(
                ctx,
                group.uin,
                member.uin,
                isPromote ? 'set' : 'unset',
            ),
        );
    });

    ctx.bot.onGroupMemberLeave((group, uin) => {
        ctx.dispatchEvent(
            new OneBotGroupDecreaseNoticeEvent(
                ctx,
                group.uin,
                uin,
                uin,
                'leave',
            ),
        );
    });

    ctx.bot.onGroupMemberKick((group, uin, operator) => {
        ctx.dispatchEvent(
            new OneBotGroupDecreaseNoticeEvent(
                ctx,
                group.uin,
                uin,
                operator?.uin ?? 0,
                uin === ctx.bot.uin ? 'kick_me' : 'kick',
            ),
        );
    });

    ctx.bot.onGroupMemberIncrease((group, member, type, operator) => {
        ctx.dispatchEvent(
            new OneBotGroupIncreaseNoticeEvent(
                ctx,
                group.uin,
                member.uin,
                operator?.uin ?? 0,
                type === IncreaseType.Invite ? 'invite' : 'approve',
            ),
        );
    });

    ctx.bot.onGroupMute((group, member, operator, duration) => {
        ctx.dispatchEvent(
            new OneBotGroupBanNoticeEvent(
                ctx,
                group.uin,
                member.uin,
                operator.uin,
                duration,
                'ban',
            ),
        );
    });

    ctx.bot.onGroupUnmute((group, member, operator) => {
        ctx.dispatchEvent(
            new OneBotGroupBanNoticeEvent(
                ctx,
                group.uin,
                member.uin,
                operator.uin,
                0,
                'lift',
            ),
        );
    });

    ctx.bot.onGroupMuteAll((group, operator, isSet) => {
        ctx.dispatchEvent(
            new OneBotGroupBanNoticeEvent(
                ctx,
                group.uin,
                0,
                operator.uin,
                -1, // forever, unless lifted
                isSet ? 'ban' : 'lift',
            ),
        );
    });

    ctx.bot.onGroupRecall(async (group, seq, tip, operator) => {
        try {
            const message = await ctx.storage.getByPeerAndSequence(
                MessageType.GroupMessage,
                group.uin,
                seq,
            );
            if (!message) {
                return;
            }
            let senderUin: number;
            if (message.storeType === MessageStoreType.PushMsgBody) {
                const body = parsePushMsgBody(message.body);
                senderUin = body.senderUin;
            } else {
                senderUin = ctx.bot.uin;
            }
            ctx.dispatchEvent(
                new OneBotGroupRecallNoticeEvent(
                    ctx,
                    group.uin,
                    senderUin,
                    operator.uin,
                    message.id,
                ),
            );
        } catch (e) {
            ctx.logger.warn(`Failed to resolve message for group recall (${group}, [${seq}]): ${e}`, {
                module: 'GroupRecall',
            });
        }
    });

    ctx.bot.onFriendRecall(async (friend, clientSeq) => {
        try {
            const message = await ctx.storage.getPrivateByClientSequence(friend.uin, clientSeq);
            if (!message) {
                return;
            }
            ctx.dispatchEvent(
                new OneBotFriendRecallNoticeEvent(
                    ctx,
                    friend.uin,
                    message.storeType === MessageStoreType.PushMsgBody ? friend.uin : ctx.bot.uin,
                    message.id,
                ),
            );
        } catch (e) {
            ctx.logger.warn(`Failed to resolve message for friend recall (${friend}, [${clientSeq}]): ${e}`, {
                module: 'FriendRecall',
            });
        }
    });

    ctx.bot.onGroupPoke((group, sender, receiver) => {
        ctx.dispatchEvent(
            new OneBotPokeNoticeEvent(
                ctx,
                group.uin,
                sender.uin,
                receiver.uin,
            ),
        );
    });
}
