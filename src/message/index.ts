import { MessageElement } from '@/core/packet/message/MessageElement';

export enum MessageType {
    PrivateMessage = 1,
    GroupMessage = 2,
}

export type MessageElementDecoded = ReturnType<typeof MessageElement.decode>;