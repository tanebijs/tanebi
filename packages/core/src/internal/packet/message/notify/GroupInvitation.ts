import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const GroupInvitation = ProtoMessage.of({
    groupUin: ProtoField(1, ScalarType.UINT32),
    invitorUid: ProtoField(5, ScalarType.STRING),
});