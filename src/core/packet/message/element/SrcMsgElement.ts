import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { MessageElement } from '@/core/packet/message/MessageElement';

export const SrcMsgElement = new NapProtoMsg({
    origSeqs: ProtoField(1, ScalarType.UINT32, false, true),
    senderUin: ProtoField(2, ScalarType.UINT64, false, false),
    time: ProtoField(3, ScalarType.SINT32, true, false),
    flag: ProtoField(4, ScalarType.SINT32, true, false),
    elems: ProtoField(5, () => MessageElement.fields, false, true),
    type: ProtoField(6, ScalarType.SINT32, true, false),
    richMsg: ProtoField(7, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(8, ScalarType.BYTES, true, false),
    sourceMsg: ProtoField(9, ScalarType.BYTES, true, false),
    toUin: ProtoField(10, ScalarType.UINT64, true, false),
    troopName: ProtoField(11, ScalarType.BYTES, true, false),
});