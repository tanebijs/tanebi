import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const StatusKickNT = ProtoMessage.of({
    tip: ProtoField(3, ScalarType.STRING),
    title: ProtoField(4, ScalarType.STRING),
});