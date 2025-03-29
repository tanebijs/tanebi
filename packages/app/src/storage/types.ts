import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { MessageType } from 'tanebi';

export interface MessageRow {
    id: number;
    createdAt: number;
    storeType: MessageStoreType;
    type: MessageType;
    peerUin: number;
    sequence: number;
    clientSequence: number | null;
    body: Buffer;
}

export enum MessageStoreType {
    PushMsgBody = 0,
    OutgoingMessageStore = 1,
}

export const OutgoingMessageStore = new NapProtoMsg({
    jsonElem: ProtoField(1, ScalarType.STRING),
    pbElem: ProtoField(2, ScalarType.BYTES),
});