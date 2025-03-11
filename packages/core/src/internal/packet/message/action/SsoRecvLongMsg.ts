import { LongMessageSettings } from '@/internal/packet/message/forward/LongMessageSettings';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const SsoRecvLongMsg = new NapProtoMsg({
    info: ProtoField(1, () => ({
        uidInfo: ProtoField(1, () => ({
            uid: ProtoField(2, ScalarType.STRING),
        })),
        resId: ProtoField(2, ScalarType.STRING),
        isAcquire: ProtoField(3, ScalarType.BOOL),
    })),
    settings: ProtoField(15, () => LongMessageSettings.fields),
});

export const SsoRecvLongMsgResponse = new NapProtoMsg({
    result: ProtoField(1, () => ({
        payload: ProtoField(4, ScalarType.BYTES),
    })),
});