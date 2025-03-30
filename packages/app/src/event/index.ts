import { OneBotApp } from '@app/index';

export abstract class OneBotEvent {
    readonly time: number;
    readonly self_id: number;

    constructor(app: OneBotApp, readonly post_type: 'message' | 'notice' | 'request' | 'meta_event') {
        this.time = Date.now();
        this.self_id = app.bot.uin ?? 0;
    }
}
