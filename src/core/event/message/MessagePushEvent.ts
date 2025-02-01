import { defineEvent } from '@/core/event/EventBase';
import { PushMsg } from '@/core/packet/message/PushMsg';

export const MessagePushEvent = defineEvent(
    'messagePush',
    'trpc.msg.olpush.OlPushService.MsgPush',
    (ctx, payload) => PushMsg.decode(payload),
);