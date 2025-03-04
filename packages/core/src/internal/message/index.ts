import { MessageElement } from '@/internal/packet/message/MessageElement';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';

export enum MessageType {
    PrivateMessage = 1,
    GroupMessage = 2,
}

export type MessageElementDecoded = NapProtoDecodeStructType<typeof MessageElement.fields>;