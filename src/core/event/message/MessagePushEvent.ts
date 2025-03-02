import { defineEvent } from '@/core/event/EventBase';
import { Event0x210SubType, PushMsg, PushMsgType } from '@/core/packet/message/PushMsg';
import { parsePushMsgBody } from '@/core/message/incoming';
import { GroupJoinRequest } from '@/core/packet/message/notify/GroupJoinRequest';
import { GroupInvitationRequest } from '@/core/packet/message/notify/GroupInvitedJoinRequest';
import { GroupAdminChange } from '@/core/packet/message/notify/GroupAdminChange';
import { GroupInvitation } from '@/core/packet/message/notify/GroupInvitation';
import { DecreaseType, GroupMemberChange, OperatorInfo } from '@/core/packet/message/notify/GroupMemberChange';
import { FriendRequest, FriendRequestExtractVia } from '@/core/packet/message/notify/FriendRequest';
import { GeneralGrayTip } from '@/core/packet/message/notify/GeneralGrayTip';
import { FriendRecall } from '@/core/packet/message/notify/FriendRecall';

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
        } else if (type === PushMsgType.Event0x210) {
            const subType = pushMsg.message.contentHead.subType as Event0x210SubType;
            if (subType === Event0x210SubType.FriendRequest) {
                const content = FriendRequest.decode(pushMsg.message.body!.msgContent!);
                ctx.eventsDX.emit('friendRequest',
                    pushMsg.message.responseHead.fromUin,
                    content.body.fromUid,
                    content.body.message,
                    content.body.via ?? FriendRequestExtractVia.decode(pushMsg.message.body!.msgContent!).body.via);
            } else if (subType === Event0x210SubType.FriendGrayTip) {
                const content = GeneralGrayTip.decode(pushMsg.message.body!.msgContent!);
                const templateParamsMap = new Map(content.templateParams.map((param) => [param.key, param.value]));
                if (content.bizType === 12) {
                    ctx.eventsDX.emit('friendPoke',
                        parseInt(templateParamsMap.get('uin_str1')!),
                        parseInt(templateParamsMap.get('uin_str2')!),
                        templateParamsMap.get('action_str') ?? templateParamsMap.get('alt_str1') ?? '',
                        templateParamsMap.get('action_img_url')!,
                        templateParamsMap.get('suffix'),);
                }
            } else if (subType === Event0x210SubType.FriendRecall) {
                const content = FriendRecall.decode(pushMsg.message.body!.msgContent!).body;
                ctx.eventsDX.emit('friendRecall', content.fromUid, content.clientSequence, content.tipInfo.tip);
            }
        }
    },
);