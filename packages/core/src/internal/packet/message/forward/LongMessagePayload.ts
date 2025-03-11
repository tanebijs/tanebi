import { PushMsgBody } from '@/internal/packet/message/PushMsg';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const LongMessagePayload = new NapProtoMsg({
    actions: ProtoField(2, () => ({
        command: ProtoField(1, ScalarType.STRING),
        data: ProtoField(2, () => ({
            msgs: ProtoField(1, () => PushMsgBody.fields, false, true),
        })),
    }), false, true),
});