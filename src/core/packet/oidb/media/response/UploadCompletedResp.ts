import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const UploadCompletedResp = new NapProtoMsg({
    msgSeq: ProtoField(1, ScalarType.UINT64, false, false),
});
