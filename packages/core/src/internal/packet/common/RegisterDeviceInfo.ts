import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const RegisterDeviceInfo = new NapProtoMsg({
    user: ProtoField(1, ScalarType.STRING),
    os: ProtoField(2, ScalarType.STRING),
    osVer: ProtoField(3, ScalarType.STRING),
    vendorName: ProtoField(4, ScalarType.STRING, true),
    osLower: ProtoField(5, ScalarType.STRING),
});