import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const LightAppElement = new NapProtoMsg({
    data: ProtoField(1, ScalarType.BYTES, true, false),
    msgResid: ProtoField(2, ScalarType.BYTES, true, false),
});