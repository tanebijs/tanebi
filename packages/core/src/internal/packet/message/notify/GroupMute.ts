import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupMute = new NapProtoMsg({
    groupUin: ProtoField(1, ScalarType.UINT32),
    operatorUid: ProtoField(4, ScalarType.STRING),
    info: ProtoField(5, () => ({
        timestamp: ProtoField(1, ScalarType.UINT32),
        state: ProtoField(3, () => ({
            targetUid: ProtoField(1, ScalarType.STRING, true),
            duration: ProtoField(2, ScalarType.UINT32),
        })),
    })),
});