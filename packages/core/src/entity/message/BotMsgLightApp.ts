import { BotMsgType } from '.';
import { IncomingSegmentOf } from '@/internal/message/incoming';

export class BotMsgLightApp implements BotMsgType {
    constructor(
        readonly appName: string,
        readonly payload: IncomingSegmentOf<'lightApp'>['payload'],
    ) {}

    toPreviewString() {
        return `[卡片消息 ${this.appName}]`;
    }
}