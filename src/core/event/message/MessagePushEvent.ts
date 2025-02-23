import { defineEvent } from '@/core/event/EventBase';
import { PushMsg, PushMsgType } from '@/core/packet/message/PushMsg';
import { parsePushMsgBody } from '@/core/message/incoming';
import { GroupJoinRequest } from '@/core/packet/message/notify/GroupJoinRequest';
import { GroupInvitationRequest } from '@/core/packet/message/notify/GroupInvitedJoinRequest';
import { GroupAdminChange } from '@/core/packet/message/notify/GroupAdminChange';
import { GroupInvitation } from '@/core/packet/message/notify/GroupInvitation';
import { DecreaseType, GroupMemberChange, OperatorInfo } from '@/core/packet/message/notify/GroupMemberChange';

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
        } else if (type === PushMsgType.GroupJoinRequest) {
            const content = GroupJoinRequest.decode(pushMsg.message.body!.msgContent!);
            ctx.eventsDX.emit('groupJoinRequest', content.groupUin, content.memberUid);
        } else if (type === PushMsgType.GroupInvitedJoinRequest) {
            const content = GroupInvitationRequest.decode(pushMsg.message.body!.msgContent!);
            if (content.command === 87) {
                ctx.eventsDX.emit('groupInvitedJoinRequest', content.info.inner.groupUin, content.info.inner.targetUid, content.info.inner.invitorUid);
            }
        } else if (type === PushMsgType.GroupInvitation) {
            const content = GroupInvitation.decode(pushMsg.message.body!.msgContent!);
            ctx.eventsDX.emit('groupInvitationRequest', content.groupUin, content.invitorUid);
        } else if (type === PushMsgType.GroupAdminChange) {
            const content = GroupAdminChange.decode(pushMsg.message.body!.msgContent!);
            if (content.body.set) {
                ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.set.targetUid, true);
            } else if (content.body.unset) {
                ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.unset.targetUid, false);
            }
        } else if (type === PushMsgType.GroupMemberIncrease) {
            const content = GroupMemberChange.decode(pushMsg.message.body!.msgContent!);
            const operatorUidOrEmpty = content.operatorInfo ? Buffer.from(content.operatorInfo).toString() : undefined;
            ctx.eventsDX.emit('groupMemberIncrease', content.groupUin, content.memberUid, operatorUidOrEmpty);
        } else if (type === PushMsgType.GroupMemberDecrease) {
            const content = GroupMemberChange.decode(pushMsg.message.body!.msgContent!);
            ctx.eventsDX.emit('groupMemberDecrease', content.groupUin, content.memberUid,
                content.type === DecreaseType.KickSelf ?
                    OperatorInfo.decode(content.operatorInfo!).body.uid :
                    (content.operatorInfo ? Buffer.from(content.operatorInfo).toString() : undefined));
        }
    },
);