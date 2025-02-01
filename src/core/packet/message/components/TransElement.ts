import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const TransElement = new NapProtoMsg({
    elemType: ProtoField(1, ScalarType.SINT32, false, false),
    elemValue: ProtoField(2, ScalarType.BYTES, true, false),
});