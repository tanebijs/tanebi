import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GeneralFlags = new NapProtoMsg({
    bubbleDiyTextId: ProtoField(1, ScalarType.SINT32, false, false),
    groupFlagNew: ProtoField(2, ScalarType.SINT32, false, false),
    uin: ProtoField(3, ScalarType.UINT64, false, false),
    rpId: ProtoField(4, ScalarType.BYTES, true, false),
    prpFold: ProtoField(5, ScalarType.SINT32, false, false),
    longTextFlag: ProtoField(6, ScalarType.SINT32, false, false),
    longTextResId: ProtoField(7, ScalarType.STRING, true, false),
    groupType: ProtoField(8, ScalarType.SINT32, false, false),
    toUinFlag: ProtoField(9, ScalarType.SINT32, false, false),
    glamourLevel: ProtoField(10, ScalarType.SINT32, false, false),
    memberLevel: ProtoField(11, ScalarType.SINT32, false, false),
    groupRankSeq: ProtoField(12, ScalarType.SINT64, false, false),
    olympicTorch: ProtoField(13, ScalarType.SINT32, false, false),
    babyqGuideMsgCookie: ProtoField(14, ScalarType.BYTES, true, false),
    uin32ExpertFlag: ProtoField(15, ScalarType.SINT32, false, false),
    bubbleSubId: ProtoField(16, ScalarType.SINT32, false, false),
    pendantId: ProtoField(17, ScalarType.SINT64, false, false),
    rpIndex: ProtoField(18, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(19, ScalarType.BYTES, true, false),
});