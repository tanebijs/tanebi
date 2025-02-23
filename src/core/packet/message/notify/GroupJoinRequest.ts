import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupJoinRequest = new NapProtoMsg({
    groupUin: ProtoField(1, ScalarType.UINT32),
    memberUid: ProtoField(3, ScalarType.STRING),
});