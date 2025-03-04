import { CommonHead } from '@/internal/packet/oidb/media/CommonHead';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const MultiMediaRespHead = new NapProtoMsg({
    common: ProtoField(1, () => CommonHead.fields, true, false),
    retCode: ProtoField(2, ScalarType.UINT32, false, false),
    message: ProtoField(3, ScalarType.STRING, true, false),
});
