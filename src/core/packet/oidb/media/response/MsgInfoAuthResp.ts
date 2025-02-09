import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const MsgInfoAuthResp = new NapProtoMsg({
    authCode: ProtoField(1, ScalarType.UINT32, false, false),
    msg: ProtoField(2, ScalarType.BYTES, true, false),
    resultTime: ProtoField(3, ScalarType.UINT64, false, false),
});
