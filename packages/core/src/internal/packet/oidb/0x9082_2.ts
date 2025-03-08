import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const RemoveGroupReaction = new OidbSvcContract(
    0x9082, 2,
    {
        groupUin: ProtoField(2, ScalarType.UINT32),
        sequence: ProtoField(3, ScalarType.UINT32),
        code: ProtoField(4, ScalarType.STRING),
        type: ProtoField(5, ScalarType.UINT32),
    },
    false, true
);