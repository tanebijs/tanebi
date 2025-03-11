import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const LongMessageSettings = new NapProtoMsg({
    field1: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
    field4: ProtoField(4, ScalarType.UINT32),
});