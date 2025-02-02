import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const NotOnlineFile = new NapProtoMsg({
    fileType: ProtoField(1, ScalarType.SINT32, true, false),
    sig: ProtoField(2, ScalarType.BYTES, true, false),
    fileUuid: ProtoField(3, ScalarType.STRING, true, false),
    fileMd5: ProtoField(4, ScalarType.BYTES, true, false),
    fileName: ProtoField(5, ScalarType.STRING, true, false),
    fileSize: ProtoField(6, ScalarType.SINT64, true, false),
    note: ProtoField(7, ScalarType.BYTES, true, false),
    reserved: ProtoField(8, ScalarType.SINT32, true, false),
    subcmd: ProtoField(9, ScalarType.SINT32, true, false),
    microCloud: ProtoField(10, ScalarType.SINT32, true, false),
    bytesFileUrls: ProtoField(11, ScalarType.BYTES, false, true),
    downloadFlag: ProtoField(12, ScalarType.SINT32, true, false),
    dangerEvel: ProtoField(50, ScalarType.SINT32, true, false),
    lifeTime: ProtoField(51, ScalarType.SINT32, true, false),
    uploadTime: ProtoField(52, ScalarType.SINT32, true, false),
    absFileType: ProtoField(53, ScalarType.SINT32, true, false),
    clientType: ProtoField(54, ScalarType.SINT32, true, false),
    expireTime: ProtoField(55, ScalarType.SINT32, true, false),
    pbReserve: ProtoField(56, ScalarType.BYTES, true, false),
    fileHash: ProtoField(57, ScalarType.STRING, true, false),
});
