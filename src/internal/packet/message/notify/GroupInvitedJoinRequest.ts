import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupInvitationRequest = new NapProtoMsg({
    command: ProtoField(1, ScalarType.INT32),
    info: ProtoField(2, () => ({
        inner: ProtoField(1, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32),
            targetUid: ProtoField(5, ScalarType.STRING),
            invitorUid: ProtoField(6, ScalarType.STRING),
        })),
    })),
});