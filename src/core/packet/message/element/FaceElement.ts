import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FaceElement = new NapProtoMsg({
    index: ProtoField(1, ScalarType.INT32, true, false),
    old: ProtoField(2, ScalarType.BYTES, true, false),
    buf: ProtoField(11, ScalarType.BYTES, true, false),
});