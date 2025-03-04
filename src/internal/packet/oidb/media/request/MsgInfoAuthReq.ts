import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const MsgInfoAuthReq = new NapProtoMsg({
    msg: ProtoField(1, ScalarType.BYTES, true, false),
    authTime: ProtoField(2, ScalarType.UINT64, false, false),
});
