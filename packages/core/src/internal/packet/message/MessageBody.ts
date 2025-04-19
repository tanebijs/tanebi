import { RichText } from '@/internal/packet/message/RichText';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MessageBody = ProtoMessage.of({
    richText: ProtoField(1, () => RichText.fields, true),
    msgContent: ProtoField(2, ScalarType.BYTES, true),
    msgEncryptContent: ProtoField(3, ScalarType.BYTES, true),
});
