import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { Tlv, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvQrCode0x0d1 = Tlv.tagged([
    TlvVariableField('body', 'bytes', 'none', false),
], '0xd1');

export const TlvQrCode0x0d1Body = new NapProtoMsg({
    system: ProtoField(1, () => ({
        os: ProtoField(1, ScalarType.STRING),
        name: ProtoField(2, ScalarType.STRING),
    })),
    type: ProtoField(4, ScalarType.BYTES), // [0x30, 0x01]
});

export const TlvQrCode0x0d1_Response = new NapProtoMsg({
    url: ProtoField(2, ScalarType.STRING),
    qrSig: ProtoField(3, ScalarType.STRING),
});