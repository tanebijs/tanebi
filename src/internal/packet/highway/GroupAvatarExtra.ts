import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupAvatarExtra = new NapProtoMsg({
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, () => ({
        field1: ProtoField(1, ScalarType.UINT32),
    })),
    field5: ProtoField(5, ScalarType.UINT32),
    field6: ProtoField(6, ScalarType.UINT32),
});
