import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const DownloadRKeyReq = new NapProtoMsg({
    types: ProtoField(1, ScalarType.INT32, false, true),
});
