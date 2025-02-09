import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FileInfo = new NapProtoMsg({
    fileSize: ProtoField(1, ScalarType.UINT32, false, false),
    fileHash: ProtoField(2, ScalarType.STRING, true, false),
    fileSha1: ProtoField(3, ScalarType.STRING, true, false),
    fileName: ProtoField(4, ScalarType.STRING, true, false),
    type: ProtoField(5, () => ({
        type: ProtoField(1, ScalarType.UINT32, false, false),
        picFormat: ProtoField(2, ScalarType.UINT32, false, false),
        videoFormat: ProtoField(3, ScalarType.UINT32, false, false),
        voiceFormat: ProtoField(4, ScalarType.UINT32, false, false),
    }), true, false),
    width: ProtoField(6, ScalarType.UINT32, false, false),
    height: ProtoField(7, ScalarType.UINT32, false, false),
    time: ProtoField(8, ScalarType.UINT32, false, false),
    original: ProtoField(9, ScalarType.UINT32, false, false),
});