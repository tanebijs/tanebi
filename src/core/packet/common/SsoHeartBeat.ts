import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const SsoHeartBeat = new NapProtoMsg({
    type: ProtoField(1, ScalarType.INT32),
});