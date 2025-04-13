import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';

export abstract class OneBotRequestEvent extends OneBotEvent {
    constructor(
        app: OneBotApp,
        readonly request_type: 'friend' | 'group',
        readonly flag: string,
    ) {
        super(app, 'request');
    }
}

export class OneBotFriendRequestEvent extends OneBotRequestEvent {
    constructor(
        app: OneBotApp,
        flag: string,
        readonly user_id: number,
        readonly comment: string,
    ) {
        super(app, 'friend', flag);
    }
}

export class OneBotGroupRequestEvent extends OneBotRequestEvent {
    constructor(
        app: OneBotApp,
        flag: string,
        readonly group_id: number,
        readonly user_id: number,
        readonly sub_type: 'add' | 'invite',
        readonly comment: string,
    ) {
        super(app, 'group', flag);
    }
}

export function installRequestEventHandler(ctx: OneBotApp) {
    ctx.bot.onFriendRequest((req) => {
        ctx.dispatchEvent(new OneBotFriendRequestEvent(
            ctx,
            req.fromUid,
            req.fromUin,
            req.message,
        ));
    });

    ctx.bot.onGroupJoinRequest((_, req) => {
        ctx.dispatchEvent(new OneBotGroupRequestEvent(
            ctx,
            'Join#' + req.sequence,
            req.groupUin,
            req.requestUin,
            'add',
            req.comment,
        ));
    });

    ctx.bot.onGroupInvitedJoinRequest((_, req) => {
        ctx.dispatchEvent(new OneBotGroupRequestEvent(
            ctx,
            'Invite#' + req.sequence,
            req.groupUin,
            req.invitor.uin,
            'invite',
            '',
        ));
    });
}
