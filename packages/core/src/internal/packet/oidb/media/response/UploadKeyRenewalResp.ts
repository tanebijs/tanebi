import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const UploadKeyRenewalResp = new NapProtoMsg({
    ukey: ProtoField(1, ScalarType.STRING, true, false),
    ukeyTtlSec: ProtoField(2, ScalarType.UINT64, false, false),
});
