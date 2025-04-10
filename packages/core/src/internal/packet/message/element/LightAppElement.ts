import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const LightAppElement = ProtoMessage.of({
    data: ProtoField(1, ScalarType.BYTES, true, false),
    msgResid: ProtoField(2, ScalarType.BYTES, true, false),
});