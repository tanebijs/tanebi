import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/binary/tlv';

export const SsoKeyExchange = new NapProtoMsg({
    publicKey: ProtoField(1, ScalarType.BYTES),
    type: ProtoField(2, ScalarType.UINT32), // 1
    gcmCalc1: ProtoField(3, ScalarType.BYTES),
    timestamp: ProtoField(4, ScalarType.UINT32),
    gcmCalc2: ProtoField(5, ScalarType.BYTES),
});

export const SsoKeyExchangePart1 = new NapProtoMsg({
    uin: ProtoField(1, ScalarType.UINT32, true),
    guid: ProtoField(2, ScalarType.STRING, true),
});

export const SsoKeyExchangePart2 = Tlv.plain([
    TlvVariableField('publicKey', 'bytes', 'none', false),
    TlvScalarField('type', 'uint32'), // 1
    TlvVariableField('encryptedGcm', 'bytes', 'none', false),
    TlvScalarField('field3', 'uint32'), // 0
    TlvScalarField('timestamp', 'uint32'),
]);

export const SsoKeyExchangeResponse = new NapProtoMsg({
    gcmEncrypted: ProtoField(1, ScalarType.BYTES),
    body: ProtoField(2, ScalarType.BYTES),
    publicKey: ProtoField(3, ScalarType.BYTES),
});

export const SsoKeyExchangeResult = new NapProtoMsg({
    gcmKey: ProtoField(1, ScalarType.BYTES),
    sign: ProtoField(2, ScalarType.BYTES),
    expiration: ProtoField(3, ScalarType.UINT32),
});