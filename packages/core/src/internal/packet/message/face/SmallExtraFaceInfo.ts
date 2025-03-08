import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const SmallExtraFaceInfo = new NapProtoMsg({
    faceId: ProtoField(1, ScalarType.UINT32),
    text1: ProtoField(2, ScalarType.STRING, true),
    text2: ProtoField(3, ScalarType.STRING, true),
});