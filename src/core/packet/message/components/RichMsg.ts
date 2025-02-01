import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const RichMsg = new NapProtoMsg({
    template1: ProtoField(1, ScalarType.BYTES, true, false),
    serviceId: ProtoField(2, ScalarType.SINT32, true, false),
    msgResId: ProtoField(3, ScalarType.BYTES, true, false),
    rand: ProtoField(4, ScalarType.SINT32, true, false),
    seq: ProtoField(5, ScalarType.SINT32, true, false),
});