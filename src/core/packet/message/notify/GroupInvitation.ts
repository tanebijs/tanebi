import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupInvitation = new NapProtoMsg({
    groupUin: ProtoField(1, ScalarType.UINT32),
    invitorUid: ProtoField(5, ScalarType.STRING),
});