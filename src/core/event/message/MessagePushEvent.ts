import { defineEvent } from '@/core/event/EventBase';
import { PushMsg, PushMsgType } from '@/core/packet/message/PushMsg';
import { parsePushMsgBody } from '@/message';

export const MessagePushEvent = defineEvent(
    'messagePush',
    'trpc.msg.olpush.OlPushService.MsgPush',
    (ctx, payload) => {
        const pushMsg = PushMsg.decode(payload);
        const type = pushMsg.message.contentHead.type as PushMsgType;

        if (type === PushMsgType.PrivateMessage
            || type === PushMsgType.GroupMessage
            || type === PushMsgType.TempMessage
            || type === PushMsgType.PrivateRecordMessage) {
            return parsePushMsgBody(pushMsg.message);
        } else if (type === PushMsgType.PrivateFileMessage) {
            // TODO: parse private file
        } else {
            // TODO: parse notification
        }
    },
);