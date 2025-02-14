import { DataHighwayHead } from '@/core/packet/highway/DataHighwayHead';
import { SegHead } from './SegHead';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const ReqDataHighwayHead = new NapProtoMsg({
    msgBaseHead: ProtoField(1, () => DataHighwayHead.fields, true),
    msgSegHead: ProtoField(2, () => SegHead.fields, true),
    bytesReqExtendInfo: ProtoField(3, ScalarType.BYTES, true),
    timestamp: ProtoField(4, ScalarType.UINT64),
    msgLoginSigHead: ProtoField(5, () => ({
        uint32LoginSigType: ProtoField(1, ScalarType.UINT32),
        bytesLoginSig: ProtoField(2, ScalarType.BYTES),
        appId: ProtoField(3, ScalarType.UINT32),
    }), true),
});
