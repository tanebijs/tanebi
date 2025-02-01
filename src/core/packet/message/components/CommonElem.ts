import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const CommonElem = new NapProtoMsg({
    serviceType: ProtoField(1, ScalarType.SINT32, false, false),
    pbElem: ProtoField(2, ScalarType.BYTES, true, false),
    businessType: ProtoField(3, ScalarType.UINT32, false, false),
});