import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const AnonymousGroupMessageElement = new NapProtoMsg({
    flags: ProtoField(1, ScalarType.SINT32, false, false),
    anonId: ProtoField(2, ScalarType.BYTES, true, false),
    anonNick: ProtoField(3, ScalarType.BYTES, true, false),
    headPortrait: ProtoField(4, ScalarType.SINT32, false, false),
    expireTime: ProtoField(5, ScalarType.SINT32, false, false),
    bubbleId: ProtoField(6, ScalarType.SINT32, false, false),
    rankColor: ProtoField(7, ScalarType.BYTES, true, false),
});