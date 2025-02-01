import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OnlineImageElement = new NapProtoMsg({
    guid: ProtoField(1, ScalarType.BYTES, true, false),
    filePath: ProtoField(2, ScalarType.BYTES, true, false),
    oldVerSendFile: ProtoField(3, ScalarType.BYTES, true, false),
});