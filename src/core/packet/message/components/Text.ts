import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const Text = new NapProtoMsg({
    str: ProtoField(1, ScalarType.STRING, true, false),
    link: ProtoField(2, ScalarType.STRING, true, false),
    attr6Buf: ProtoField(3, ScalarType.BYTES, true, false),
    attr7Buf: ProtoField(4, ScalarType.BYTES, true, false),
    buf: ProtoField(11, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(12, ScalarType.BYTES, true, false),
});