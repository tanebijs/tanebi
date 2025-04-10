import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export const KickMember = new OidbSvcContract(
    0x8a0, 1,
    {
        groupUin: ProtoField(1, ScalarType.UINT32),
        memberUin: ProtoField(3, ScalarType.STRING),
        rejectSubsequentRequests: ProtoField(4, ScalarType.BOOL),
        reason: ProtoField(5, ScalarType.STRING),
    }
);