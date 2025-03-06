import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupReaction = new NapProtoMsg({
    data: ProtoField(1, () => ({
        data: ProtoField(1, () => ({
            target: ProtoField(2, () => ({
                sequence: ProtoField(1, ScalarType.UINT32, false, false),
            })),
            data: ProtoField(3, () => ({
                code: ProtoField(1, ScalarType.STRING),
                count: ProtoField(3, ScalarType.UINT32),
                operatorUid: ProtoField(4, ScalarType.STRING),
                type: ProtoField(5, ScalarType.UINT32),
            })),
        })),
    })),
});