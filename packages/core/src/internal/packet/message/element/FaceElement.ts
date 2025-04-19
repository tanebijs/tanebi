import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const FaceElement = ProtoMessage.of({
    index: ProtoField(1, ScalarType.INT32, true, false),
    old: ProtoField(2, ScalarType.BYTES, true, false),
    buf: ProtoField(11, ScalarType.BYTES, true, false),
});
