import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const RichMsgElement = new NapProtoMsg({
    template1: ProtoField(1, ScalarType.BYTES, true, false),
    serviceId: ProtoField(2, ScalarType.INT32, true, false),
    msgResId: ProtoField(3, ScalarType.BYTES, true, false),
    rand: ProtoField(4, ScalarType.INT32, true, false),
    seq: ProtoField(5, ScalarType.INT32, true, false),
});