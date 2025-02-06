import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { NTSysEvent } from '@/core/packet/common/NTSysEvent';
import { MessageContentHead } from '@/core/packet/message/MessageContentHead';
import { MessageBody } from '@/core/packet/message/MessageBody';

export const PushMsg = new NapProtoMsg({
    message: ProtoField(1, () => PushMsgBody.fields),
    status: ProtoField(3, ScalarType.INT32, true),
    ntEvent: ProtoField(4, () => NTSysEvent.fields, true),
    pingFlag: ProtoField(5, ScalarType.INT32, true),
    generalFlag: ProtoField(9, ScalarType.INT32, true),
});

export enum PushMsgType {
    PrivateMessage = 166,
    GroupMessage = 82,
    TempMessage = 141,

    Event0x210 = 528,                   // friend related event
    Event0x2DC = 732,                   // group related event

    PrivateRecordMessage = 208,
    PrivateFileMessage = 529,

    GroupRequestInvitationNotice = 525, // from group member invitation
    GroupRequestJoinNotice = 84,        // directly entered
    GroupInviteNotice = 87,             // the bot self is being invited
    GroupAdminChangedNotice = 44,       // admin change, both on and off
    GroupMemberIncreaseNotice = 33,
    GroupMemberDecreaseNotice = 34,
}

export enum Event0x2DCSubType {
    GroupMuteNotice = 12,
    SubType16 = 16,
    GroupRecallNotice = 17,
    GroupEssenceNotice = 21,
    GroupGreyTipNotice = 20,
}

export enum Event0x2DCSubType16Field13 {
    GroupMemberSpecialTitleNotice = 6,
    GroupNameChangeNotice = 12,
    GroupTodoNotice = 23,
    GroupReactionNotice = 35,
}

export enum Event0x210SubType {
    FriendRequestNotice = 35,
    GroupMemberEnterNotice = 38,
    FriendDeleteOrPinChangedNotice = 39,
    FriendRecallNotice = 138,
    ServicePinChanged = 199,            // e.g: My computer | QQ Wallet | ...
    FriendPokeNotice = 290,
    GroupKickNotice = 212,
}

export const PushMsgBody = new NapProtoMsg({
    responseHead: ProtoField(1, () => ({
        fromUin: ProtoField(1, ScalarType.UINT32),
        fromUid: ProtoField(2, ScalarType.STRING, true),
        type: ProtoField(3, ScalarType.UINT32),
        sigMap: ProtoField(4, ScalarType.UINT32),
        toUin: ProtoField(5, ScalarType.UINT32),
        toUid: ProtoField(6, ScalarType.STRING, true),
        friendExt: ProtoField(7, () => ({
            friendName: ProtoField(6, ScalarType.STRING, true)
        }), true),
        groupExt: ProtoField(8, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32),
            memberName: ProtoField(4, ScalarType.STRING),
            unknown5: ProtoField(5, ScalarType.UINT32),
            groupName: ProtoField(7, ScalarType.STRING),
        }), true),
    })),
    contentHead: ProtoField(2, () => MessageContentHead.fields),
    body: ProtoField(3, () => MessageBody.fields, true),
});
