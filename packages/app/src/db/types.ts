import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export enum MessageStoreType {
    PushMsgBody = 0,
    OutgoingMessageStore = 1,
}

export const OutgoingMessageStore = new NapProtoMsg({
    jsonElem: ProtoField(1, ScalarType.STRING),
    pbElem: ProtoField(2, ScalarType.BYTES),
});