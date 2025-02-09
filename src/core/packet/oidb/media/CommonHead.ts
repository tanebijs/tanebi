import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const CommonHead = new NapProtoMsg({
    requestId: ProtoField(1, ScalarType.UINT32, false, false),
    command: ProtoField(2, ScalarType.UINT32, false, false),
});