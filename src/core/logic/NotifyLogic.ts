import { LogicBase } from '@/core/logic/LogicBase';
import { FriendRecall } from '@/core/packet/message/notify/FriendRecall';
import { FriendRequest, FriendRequestExtractVia } from '@/core/packet/message/notify/FriendRequest';
import { GeneralGrayTip } from '@/core/packet/message/notify/GeneralGrayTip';
import { GroupAdminChange } from '@/core/packet/message/notify/GroupAdminChange';
import { GroupInvitation } from '@/core/packet/message/notify/GroupInvitation';
import { GroupInvitationRequest } from '@/core/packet/message/notify/GroupInvitedJoinRequest';
import { GroupJoinRequest } from '@/core/packet/message/notify/GroupJoinRequest';
import { GroupMemberChange, DecreaseType, OperatorInfo } from '@/core/packet/message/notify/GroupMemberChange';
import { Event0x210SubType, PushMsg, PushMsgType } from '@/core/packet/message/PushMsg';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';

export class NotifyLogic extends LogicBase {
    parseMessagePush(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>, type: PushMsgType) {
        if (type === PushMsgType.GroupJoinRequest) {
            this.parseGroupJoinRequest(pushMsg);
        } else if (type === PushMsgType.GroupInvitedJoinRequest) {
            this.parseGroupInvitedJoinRequest(pushMsg);
        } else if (type === PushMsgType.GroupInvitation) {
            this.parseGroupInvitation(pushMsg);
        } else if (type === PushMsgType.GroupAdminChange) {
            this.parseGroupAdminChange(pushMsg);
        } else if (type === PushMsgType.GroupMemberIncrease) {
            this.parseGroupMemberIncrease(pushMsg);
        } else if (type === PushMsgType.GroupMemberDecrease) {
            this.parseGroupMemberDecrease(pushMsg);
        } else if (type === PushMsgType.Event0x210) {
            const subType = pushMsg.message.contentHead.subType as Event0x210SubType;
            if (subType === Event0x210SubType.FriendRequest) {
                this.parseFriendRequest(pushMsg);
            } else if (subType === Event0x210SubType.FriendGrayTip) {
                this.parseFriendGrayTip(pushMsg);
            } else if (subType === Event0x210SubType.FriendRecall) {
                this.parseFriendRecall(pushMsg);
            }
        }
    }

    parseGroupJoinRequest(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupJoinRequest.decode(pushMsg.message.body!.msgContent!);
        this.ctx.eventsDX.emit('groupJoinRequest', content.groupUin, content.memberUid);
    }

    parseGroupInvitedJoinRequest(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupInvitationRequest.decode(pushMsg.message.body!.msgContent!);
        if (content.command === 87) {
            this.ctx.eventsDX.emit('groupInvitedJoinRequest', content.info.inner.groupUin, content.info.inner.targetUid, content.info.inner.invitorUid);
        }
    }

    parseGroupInvitation(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupInvitation.decode(pushMsg.message.body!.msgContent!);
        this.ctx.eventsDX.emit('groupInvitationRequest', content.groupUin, content.invitorUid);
    }

    parseGroupAdminChange(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupAdminChange.decode(pushMsg.message.body!.msgContent!);
        if (content.body.set) {
            this.ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.set.targetUid, true);
        } else if (content.body.unset) {
            this.ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.unset.targetUid, false);
        }
    }

    parseGroupMemberIncrease(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupMemberChange.decode(pushMsg.message.body!.msgContent!);
        const operatorUidOrEmpty = content.operatorInfo ? Buffer.from(content.operatorInfo).toString() : undefined;
        this.ctx.eventsDX.emit('groupMemberIncrease', content.groupUin, content.memberUid, operatorUidOrEmpty);
    }

    parseGroupMemberDecrease(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupMemberChange.decode(pushMsg.message.body!.msgContent!);
        this.ctx.eventsDX.emit('groupMemberDecrease', content.groupUin, content.memberUid,
            content.type === DecreaseType.KickSelf ?
                OperatorInfo.decode(content.operatorInfo!).body.uid :
                (content.operatorInfo ? Buffer.from(content.operatorInfo).toString() : undefined));
    }

    parseFriendRequest(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = FriendRequest.decode(pushMsg.message.body!.msgContent!);
        this.ctx.eventsDX.emit('friendRequest',
            pushMsg.message.responseHead.fromUin,
            content.body.fromUid,
            content.body.message,
            content.body.via ?? FriendRequestExtractVia.decode(pushMsg.message.body!.msgContent!).body.via);
    }

    parseFriendGrayTip(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GeneralGrayTip.decode(pushMsg.message.body!.msgContent!);
        const templateParamsMap = new Map(content.templateParams.map((param) => [param.key, param.value]));
        if (content.bizType === 12) {
            this.ctx.eventsDX.emit('friendPoke',
                parseInt(templateParamsMap.get('uin_str1')!),
                parseInt(templateParamsMap.get('uin_str2')!),
                templateParamsMap.get('action_str') ?? templateParamsMap.get('alt_str1') ?? '',
                templateParamsMap.get('action_img_url')!,
                templateParamsMap.get('suffix'),);
        }
    }

    parseFriendRecall(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = FriendRecall.decode(pushMsg.message.body!.msgContent!).body;
        this.ctx.eventsDX.emit('friendRecall', content.fromUid, content.clientSequence, content.tipInfo.tip);
    }
}