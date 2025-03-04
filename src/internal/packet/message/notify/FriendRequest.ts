import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FriendRequest = new NapProtoMsg({
    body: ProtoField(1, () => ({
        fromUid: ProtoField(2, ScalarType.STRING),
        message: ProtoField(10, ScalarType.STRING),
        via: ProtoField(11, ScalarType.STRING, true),
    })),
});

// SBTX
export const FriendRequestExtractVia = new NapProtoMsg({
    body: ProtoField(1, () => ({
        via: ProtoField(5, ScalarType.STRING),
    })),
});