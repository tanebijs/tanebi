import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export enum ReactionType {
    Face = 1,
    Emoji = 2,
}

export const AddGroupReaction = new OidbSvcContract(
    0x9082,
    1,
    {
        groupUin: ProtoField(2, ScalarType.UINT32),
        sequence: ProtoField(3, ScalarType.UINT32),
        code: ProtoField(4, ScalarType.STRING),
        type: ProtoField(5, ScalarType.UINT32),
    },
    false,
    true,
);

export const RemoveGroupReaction = new OidbSvcContract(
    0x9082,
    2,
    {
        groupUin: ProtoField(2, ScalarType.UINT32),
        sequence: ProtoField(3, ScalarType.UINT32),
        code: ProtoField(4, ScalarType.STRING),
        type: ProtoField(5, ScalarType.UINT32),
    },
    false,
    true,
);
