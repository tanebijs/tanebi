import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const StatusKickNT = new NapProtoMsg({
    tip: ProtoField(3, ScalarType.STRING),
    title: ProtoField(4, ScalarType.STRING),
});