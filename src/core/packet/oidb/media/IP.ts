import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const IPv4 = new NapProtoMsg({
    outIP: ProtoField(1, ScalarType.UINT32, false, false),
    outPort: ProtoField(2, ScalarType.UINT32, false, false),
    inIP: ProtoField(3, ScalarType.UINT32, false, false),
    inPort: ProtoField(4, ScalarType.UINT32, false, false),
    ipType: ProtoField(5, ScalarType.UINT32, false, false),
});

export const IPv6 = new NapProtoMsg({
    outIP: ProtoField(1, ScalarType.BYTES, true, false),
    outPort: ProtoField(2, ScalarType.UINT32, false, false),
    inIP: ProtoField(3, ScalarType.BYTES, true, false),
    inPort: ProtoField(4, ScalarType.UINT32, false, false),
    ipType: ProtoField(5, ScalarType.UINT32, false, false),
});