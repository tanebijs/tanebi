import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

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