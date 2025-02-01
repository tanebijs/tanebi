import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { RichText } from '@/core/packet/message/conponents/RichText';

export const MessageBody = new NapProtoMsg({
    richText: ProtoField(1, () => RichText.fields, true),
    msgContent: ProtoField(2, ScalarType.BYTES, true),
    msgEncryptContent: ProtoField(3, ScalarType.BYTES, true),
});