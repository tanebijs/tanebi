import { OneBotEvent } from '@/event';
import { OneBotApp } from '@/index';
import { encodeCQCode } from '@/message/cqcode';
import { OneBotRecvSegment } from '@/message/segment';

export abstract class OneBotMessageEvent extends OneBotEvent {
    readonly message: OneBotRecvSegment[] | string;

    constructor(
        app: OneBotApp,
        readonly message_type: 'private' | 'group',
        readonly message_id: number,
        readonly user_id: number,
        readonly raw_message: string,
        readonly font: number,
        segments: OneBotRecvSegment[],
    ) {
        super(app, 'message');
        if (app.config.messageReportType === 'array') {
            this.message = segments;
        } else {
            this.message = segments.map(encodeCQCode).join('');
        }
    }
}

export class OneBotPrivateMessageEvent extends OneBotMessageEvent {
    constructor(
        app: OneBotApp,
        message_id: number,
        user_id: number,
        raw_message: string,
        font: number,
        segments: OneBotRecvSegment[],
        readonly sub_type: 'friend' | 'group' | 'other',
        readonly sender: {
            user_id: number;
            nickname: string;
            sex: string;
            age: number;
        }
    ) {
        super(app, 'private', message_id, user_id, raw_message, font, segments);
    }
}

export class OneBotGroupMessageEvent extends OneBotMessageEvent {
    constructor(
        app: OneBotApp,
        message_id: number,
        user_id: number,
        raw_message: string,
        font: number,
        segments: OneBotRecvSegment[],
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
        super(app, 'group', message_id, user_id, raw_message, font, segments);
    }
}
