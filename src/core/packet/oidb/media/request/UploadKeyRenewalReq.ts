import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const UploadKeyRenewalReq = new NapProtoMsg({
    oldUKey: ProtoField(1, ScalarType.STRING, true, false),
    subType: ProtoField(2, ScalarType.UINT32, false, false),
});
