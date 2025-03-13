import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FetchGroupNotifies = new OidbSvcContract(
    0x10c0, 1,
    {
        count: ProtoField(1, ScalarType.UINT32),
        field2: ProtoField(2, ScalarType.UINT32),
    }
);

export const FetchGroupFilteredNotifies = new OidbSvcContract(
    0x10c0, 2,
    {
        count: ProtoField(1, ScalarType.UINT32),
        field2: ProtoField(2, ScalarType.UINT32),
    }
);

export enum GroupNotifyType {
    JoinRequest = 1,
    Invitation = 2,
    KickMember = 6,
    KickSelf = 7,
    ExitGroup = 13,
    InvitedJoinRequest = 22,
}

export enum GroupRequestState {
    WaitingForAction = 1,
    Completed = 2,
}

export const FetchGroupNotifiesGeneralResponse = new NapProtoMsg({
    requests: ProtoField(1, () => ({
        sequence: ProtoField(1, ScalarType.UINT64),
        notifyType: ProtoField(2, ScalarType.UINT32),
        requestState: ProtoField(3, ScalarType.UINT32),
        group: ProtoField(4, () => ResponseGroup.fields),
        target: ProtoField(5, () => ResponseUser.fields),
        invitor: ProtoField(6, () => ResponseUser.fields, true),
        operator: ProtoField(7, () => ResponseUser.fields, true),
        comment: ProtoField(10, ScalarType.STRING),
    }), false, true),
    newLatestSequence: ProtoField(3, ScalarType.UINT64),
});

export const FetchGroupNotifiesResponse = new OidbSvcContract(
    0x10c0, 1,
    FetchGroupNotifiesGeneralResponse.fields
);

export const FetchGroupFilteredNotifiesResponse = new OidbSvcContract(
    0x10c0, 2,
    FetchGroupNotifiesGeneralResponse.fields
);

const ResponseGroup = new NapProtoMsg({
    groupUin: ProtoField(1, ScalarType.UINT32),
    groupName: ProtoField(2, ScalarType.STRING),
});

const ResponseUser = new NapProtoMsg({
    uid: ProtoField(1, ScalarType.STRING),
    nickname: ProtoField(2, ScalarType.STRING),
});