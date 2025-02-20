import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const ExtBizInfo = new NapProtoMsg({
    pic: ProtoField(1, () => PicExtBizInfo.fields, true, false),
    video: ProtoField(2, () => VideoExtBizInfo.fields, true, false),
    ptt: ProtoField(3, () => PttExtBizInfo.fields, true, false),
    busiType: ProtoField(10, ScalarType.UINT32, false, false),
});

export const PicExtBizInfo = new NapProtoMsg({
    bizType: ProtoField(1, ScalarType.UINT32, false, false),
    textSummary: ProtoField(2, ScalarType.STRING, true, false),
    bytesPbReserveC2c: ProtoField(11, () => ({
        subType: ProtoField(1, ScalarType.UINT32),
        field3: ProtoField(3, ScalarType.UINT32),
        field4: ProtoField(4, ScalarType.UINT32),
        field8: ProtoField(8, ScalarType.STRING),
        field10: ProtoField(10, ScalarType.UINT32),
        field12: ProtoField(12, ScalarType.STRING),
        field18: ProtoField(18, ScalarType.STRING),
        field19: ProtoField(19, ScalarType.STRING),
        field20: ProtoField(20, ScalarType.BYTES),
    }), true, false),
    bytesPbReserveTroop: ProtoField(12, () => ({
        subType: ProtoField(1, ScalarType.UINT32),
        field3: ProtoField(3, ScalarType.UINT32),
        field4: ProtoField(4, ScalarType.UINT32),
        field9: ProtoField(9, ScalarType.STRING),
        field10: ProtoField(10, ScalarType.UINT32),
        field12: ProtoField(12, ScalarType.STRING),
        field18: ProtoField(18, ScalarType.STRING),
        field19: ProtoField(19, ScalarType.STRING),
        field21: ProtoField(21, ScalarType.BYTES),
    }), true, false),
    fromScene: ProtoField(1001, ScalarType.UINT32, false, false),
    toScene: ProtoField(1002, ScalarType.UINT32, false, false),
    oldFileId: ProtoField(1003, ScalarType.UINT32, false, false),
});

export const VideoExtBizInfo = new NapProtoMsg({
    fromScene: ProtoField(1, ScalarType.UINT32, false, false),
    toScene: ProtoField(2, ScalarType.UINT32, false, false),
    bytesPbReserve: ProtoField(3, ScalarType.BYTES, true, false),
});

export const PttExtBizInfo = new NapProtoMsg({
    srcUin: ProtoField(1, ScalarType.UINT64, false, false),
    pttScene: ProtoField(2, ScalarType.UINT32, false, false),
    pttType: ProtoField(3, ScalarType.UINT32, false, false),
    changeVoice: ProtoField(4, ScalarType.UINT32, false, false),
    waveform: ProtoField(5, ScalarType.BYTES, true, false),
    autoConvertText: ProtoField(6, ScalarType.UINT32, false, false),
    bytesReserve: ProtoField(11, ScalarType.BYTES, true, false),
    bytesPbReserve: ProtoField(12, ScalarType.BYTES, true, false),
    bytesGeneralFlags: ProtoField(13, ScalarType.BYTES, true, false),
});

