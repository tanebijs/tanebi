import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FriendRecall = new NapProtoMsg({
    body: ProtoField(1, () => ({
        fromUid: ProtoField(1, ScalarType.STRING),
        clientSequence: ProtoField(3, ScalarType.UINT32),
        tipInfo: ProtoField(13, () => ({
            tip: ProtoField(2, ScalarType.STRING),
        })),
    }))
});