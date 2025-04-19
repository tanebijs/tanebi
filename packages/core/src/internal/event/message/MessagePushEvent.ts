import { defineEvent } from '@/internal/event/EventBase';
import { parsePushMsgBody } from '@/internal/message/incoming';
import { PushMsg, PushMsgBody, PushMsgType } from '@/internal/packet/message/PushMsg';

export const MessagePushEvent = defineEvent(
    'messagePush',
    'trpc.msg.olpush.OlPushService.MsgPush',
    (ctx, payload) => {
        const pushMsg = PushMsg.decode(payload);
        const pushMsgBody = PushMsgBody.decode(pushMsg.message);
        const type = pushMsgBody.contentHead.type as PushMsgType;

        if (
            type === PushMsgType.PrivateMessage ||
            type === PushMsgType.GroupMessage ||
            type === PushMsgType.TempMessage ||
            type === PushMsgType.PrivateRecordMessage
        ) {
            return parsePushMsgBody(pushMsg.message);
        } else if (type === PushMsgType.PrivateFileMessage) {
            // TODO: parse private file
        } else {
            ctx.notifyLogic.parsePushMsgBodyToNotify(pushMsgBody, type);
        }
    },
);
