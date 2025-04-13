import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';

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
        readonly sub_type: 'invite' | 'approve' | 'enter',
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
