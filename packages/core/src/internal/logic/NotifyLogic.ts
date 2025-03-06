import { LogicBase } from '@/internal/logic/LogicBase';
import { FriendRecall } from '@/internal/packet/message/notify/FriendRecall';
import { FriendRequest, FriendRequestExtractVia } from '@/internal/packet/message/notify/FriendRequest';
import { GroupGeneral0x2DC, GroupGeneral0x2DCBody } from '@/internal/packet/message/notify/GroupGeneral0x2DC';
import { GeneralGrayTip } from '@/internal/packet/message/notify/GeneralGrayTip';
import { GroupAdminChange } from '@/internal/packet/message/notify/GroupAdminChange';
import { GroupInvitation } from '@/internal/packet/message/notify/GroupInvitation';
import { GroupInvitationRequest } from '@/internal/packet/message/notify/GroupInvitedJoinRequest';
import { GroupJoinRequest } from '@/internal/packet/message/notify/GroupJoinRequest';
import { GroupMemberChange, DecreaseType, OperatorInfo } from '@/internal/packet/message/notify/GroupMemberChange';
import { GroupMute } from '@/internal/packet/message/notify/GroupMute';
import { Event0x210SubType, Event0x2DCSubType, Event0x2DCSubType16Field13, PushMsg, PushMsgType } from '@/internal/packet/message/PushMsg';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';
import { GroupEssenceMessageChangeSetFlag } from '@/internal/packet/message/notify/GroupEssenceMessageChange';

export class NotifyLogic extends LogicBase {
    parseMessagePush(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>, type: PushMsgType) {
        if (!pushMsg.message.body?.msgContent) {
            return;
        }

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
        } else if (type === PushMsgType.Event0x2DC) {
            const subType = pushMsg.message.contentHead.subType as Event0x2DCSubType;
            if (subType === Event0x2DCSubType.GroupMute) {
                this.parseGroupMute(pushMsg);
            } else if (subType === Event0x2DCSubType.GroupGrayTip) {
                this.parseGroupGrayTip(pushMsg);
            } else if (subType === Event0x2DCSubType.GroupEssenceMessageChange) {
                this.parseGroupEssenceMessageChange(pushMsg);
            } else if (subType === Event0x2DCSubType.GroupRecall) {
                this.parseGroupRecall(pushMsg);
            } else if (subType === Event0x2DCSubType.SubType16) {
                const wrapper = GroupGeneral0x2DCBody.decode(
                    GroupGeneral0x2DC.decode(Buffer.from(pushMsg.message.body!.msgContent!)).body);
                if (wrapper.field13 === Event0x2DCSubType16Field13.GroupReaction) {
                    this.parseGroupReaction(wrapper);
                }
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
                templateParamsMap.get('suffix_str'));
        }
    }

    parseFriendRecall(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = FriendRecall.decode(pushMsg.message.body!.msgContent!).body;
        this.ctx.eventsDX.emit('friendRecall', content.fromUid, content.clientSequence, content.tipInfo.tip);
    }

    parseGroupMute(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const content = GroupMute.decode(pushMsg.message.body!.msgContent!);
        if (content.info.state.targetUid) {
            this.ctx.eventsDX.emit('groupMute', content.groupUin, content.operatorUid, content.info.state.targetUid, content.info.state.duration);
        } else {
            this.ctx.eventsDX.emit('groupMuteAll', content.groupUin, content.operatorUid, content.info.state.duration !== 0);
        }
    }

    parseGroupGrayTip(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(Buffer.from(pushMsg.message.body!.msgContent!)).body);
        const content = wrapper.generalGrayTip!;
        const templateParamsMap = new Map(content.templateParams.map((param) => [param.key, param.value]));
        if (content.bizType === 12) {
            this.ctx.eventsDX.emit('groupPoke',
                wrapper.groupUin,
                parseInt(templateParamsMap.get('uin_str1')!),
                parseInt(templateParamsMap.get('uin_str2')!),
                templateParamsMap.get('action_str') ?? templateParamsMap.get('alt_str1') ?? '',
                templateParamsMap.get('action_img_url')!,
                templateParamsMap.get('suffix_str'));
        }
    }

    parseGroupEssenceMessageChange(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(Buffer.from(pushMsg.message.body!.msgContent!)).body);
        const content = wrapper.essenceMessageChange!;
        this.ctx.eventsDX.emit('groupEssenceMessageChange',
            content.groupUin, content.msgSequence, content.operatorUin,
            content.setFlag === GroupEssenceMessageChangeSetFlag.Add);
    }

    parseGroupRecall(pushMsg: NapProtoDecodeStructType<typeof PushMsg.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(Buffer.from(pushMsg.message.body!.msgContent!)).body);
        const content = wrapper.recall!;
        content.recallMessages.forEach((recall) => {
            this.ctx.eventsDX.emit('groupRecall',
                wrapper.groupUin, recall.sequence, content.tipInfo?.tip ?? '', content.operatorUid);
        });
    }

    parseGroupReaction(
        wrapper: NapProtoDecodeStructType<typeof GroupGeneral0x2DCBody.fields>,
    ) {
        const content = wrapper.reaction!;
        this.ctx.eventsDX.emit('groupReaction',
            wrapper.groupUin,
            content.data.data.target.sequence,
            content.data.data.data.operatorUid,
            content.data.data.data.code,
            content.data.data.data.type === 1,
            content.data.data.data.count);
    }
}