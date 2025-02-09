import { IPv4, IPv6 } from '@/core/packet/oidb/media/IP';
import { MsgInfo } from '@/core/packet/oidb/media/MsgInfo';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const UploadResp = new NapProtoMsg({
    uKey: ProtoField(1, ScalarType.STRING, true, false),
    uKeyTtlSecond: ProtoField(2, ScalarType.UINT32, false, false),
    iPv4s: ProtoField(3, () => IPv4.fields, false, true),
    iPv6s: ProtoField(4, () => IPv6.fields, false, true),
    msgSeq: ProtoField(5, ScalarType.UINT64, false, false),
    msgInfo: ProtoField(6, () => MsgInfo.fields, true, false),
    ext: ProtoField(7, () => ({
        subType: ProtoField(1, ScalarType.UINT32, false, false),
        extType: ProtoField(2, ScalarType.UINT32, false, false),
        extValue: ProtoField(3, ScalarType.BYTES, true, false),
    }), false, true),
    compatQMsg: ProtoField(8, ScalarType.BYTES, true, false),
    subFileInfos: ProtoField(10, () => ({
        subType: ProtoField(1, ScalarType.UINT32, false, false),
        uKey: ProtoField(2, ScalarType.STRING, true, false),
        uKeyTtlSecond: ProtoField(3, ScalarType.UINT32, false, false),
        iPv4s: ProtoField(4, () => IPv4.fields, false, true),
        iPv6s: ProtoField(5, () => IPv6.fields, false, true),
    }), false, true),
});
