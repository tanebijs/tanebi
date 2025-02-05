import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const CustomElement = new NapProtoMsg({
    desc: ProtoField(1, ScalarType.BYTES, true, false),
    data: ProtoField(2, ScalarType.BYTES, true, false),
    enumType: ProtoField(3, ScalarType.INT32, false, false),
    ext: ProtoField(4, ScalarType.BYTES, true, false),
    sound: ProtoField(5, ScalarType.BYTES, true, false),
});