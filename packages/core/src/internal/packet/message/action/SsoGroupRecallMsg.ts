import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const SsoGroupRecallMsg = new NapProtoMsg({
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    info: ProtoField(3, () => ({
        sequence: ProtoField(1, ScalarType.UINT32),
    })),
});