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
