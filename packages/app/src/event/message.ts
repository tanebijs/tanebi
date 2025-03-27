import { OneBotEvent } from '@/event';
import { OneBotApp } from '@/index';

export abstract class OneBotMessageEvent extends OneBotEvent {
    constructor(
        app: OneBotApp,
        readonly message_type: 'private' | 'group',
        readonly message_id: number,
        readonly user_id: number,
        readonly message: string, // TODO: Message type
        readonly raw_message: string,
        readonly font: number
    ) {
        super(app, 'message');
    }
}

export class OneBotPrivateMessageEvent extends OneBotMessageEvent {
    constructor(
        app: OneBotApp,
        message_id: number,
        user_id: number,
        message: string,
        raw_message: string,
        font: number,
        readonly sub_type: 'friend' | 'group' | 'other',
        readonly sender: {
            user_id: number;
            nickname: string;
            sex: string;
            age: number;
        }
    ) {
        super(app, 'private', message_id, user_id, message, raw_message, font);
    }
}

export class OneBotGroupMessageEvent extends OneBotMessageEvent {
    constructor(
        app: OneBotApp,
        message_id: number,
        user_id: number,
        message: string,
        raw_message: string,
        font: number,
        readonly sub_type: 'normal' | 'notice',
        readonly group_id: number,
        readonly sender: {
            user_id: number;
            nickname: string;
            card: string;
            sex: string;
            age: number;
            area: string;
            level: string;
            role: string;
            title: string;
        }
    ) {
        super(app, 'group', message_id, user_id, message, raw_message, font);
    }
}
