import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const GroupJoinRequest = ProtoMessage.of({
    groupUin: ProtoField(1, ScalarType.UINT32),
    memberUid: ProtoField(3, ScalarType.STRING),
});