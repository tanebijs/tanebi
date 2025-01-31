import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { Tlv, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';

export const SsoKeyExchange = new NapProtoMsg({
    publicKey: ProtoField(1, ScalarType.BYTES),
    type: ProtoField(2, ScalarType.SINT32), // 1
    gcmCalc1: ProtoField(3, ScalarType.BYTES),
    timestamp: ProtoField(4, ScalarType.UINT32),
    gcmCalc2: ProtoField(5, ScalarType.BYTES),
});

export const SsoKeyExchangePart1 = new NapProtoMsg({
    uin: ProtoField(1, ScalarType.STRING, true),
    guid: ProtoField(2, ScalarType.BYTES, true),
});

export const SsoKeyExchangePart2 = Tlv.plain([
    TlvVariableField('publicKey', 'bytes', 'none', false),
    TlvScalarField('type', 'int32'), // 1
    TlvVariableField('encryptedGcm', 'bytes', 'none', false),
    TlvScalarField('field3', 'uint32'), // 0
    TlvScalarField('timestamp', 'uint32'),
]);