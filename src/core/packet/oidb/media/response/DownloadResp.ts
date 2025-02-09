import { IPv4, IPv6 } from '@/core/packet/oidb/media/IP';
import { PicUrlExtInfo, VideoExtInfo } from '@/core/packet/oidb/media/MsgInfo';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const DownloadResp = new NapProtoMsg({
    rKeyParam: ProtoField(1, ScalarType.STRING, true, false),
    rKeyTtlSecond: ProtoField(2, ScalarType.UINT32, false, false),
    info: ProtoField(3, () => ({
        domain: ProtoField(1, ScalarType.STRING, true, false),
        urlPath: ProtoField(2, ScalarType.STRING, true, false),
        httpsPort: ProtoField(3, ScalarType.UINT32, false, false),
        iPv4s: ProtoField(4, () => IPv4.fields, false, true),
        iPv6s: ProtoField(5, () => IPv6.fields, false, true),
        picUrlExtInfo: ProtoField(6, () => PicUrlExtInfo.fields, true, false),
        videoExtInfo: ProtoField(7, () => VideoExtInfo.fields, true, false),
    }), true, false),
    rKeyCreateTime: ProtoField(4, ScalarType.UINT32, false, false),
});
