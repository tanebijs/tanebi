import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupFile = new NapProtoMsg({
    filename: ProtoField(1, ScalarType.BYTES, true, false),
    fileSize: ProtoField(2, ScalarType.SINT64, false, false),
    fileId: ProtoField(3, ScalarType.BYTES, true, false),
    batchId: ProtoField(4, ScalarType.BYTES, true, false),
    fileKey: ProtoField(5, ScalarType.BYTES, true, false),
    mark: ProtoField(6, ScalarType.BYTES, true, false),
    sequence: ProtoField(7, ScalarType.SINT64, false, false),
    batchItemId: ProtoField(8, ScalarType.BYTES, true, false),
    feedMsgTime: ProtoField(9, ScalarType.SINT32, false, false),
    pbReserve: ProtoField(10, ScalarType.BYTES, true, false),
});