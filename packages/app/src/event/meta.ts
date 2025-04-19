import { OneBotEvent } from '@app/event';
import { OneBotApp } from '@app/index';

export abstract class OneBotMetaEvent extends OneBotEvent {
    constructor(
        app: OneBotApp,
        readonly meta_event_type: 'heartbeat' | 'lifecycle',
    ) {
        super(app, 'meta_event');
    }
}

export class OneBotHeartbeatEvent extends OneBotMetaEvent {
    constructor(
        app: OneBotApp,
        readonly status: unknown,
        readonly interval: number,
    ) {
        super(app, 'heartbeat');
    }
}

export class OneBotLifecycleEvent extends OneBotMetaEvent {
    constructor(
        app: OneBotApp,
        readonly sub_type: 'enable' | 'disable' | 'connect',
    ) {
        super(app, 'lifecycle');
    }
}
