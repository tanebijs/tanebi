import { MessageElement } from '@/internal/packet/message/MessageElement';
import { InferProtoModel, InferProtoModelInput } from '@tanebijs/protobuf';

export enum MessageType {
    PrivateMessage = 1,
    GroupMessage = 2,
}

export type MessageElementDecoded = InferProtoModel<typeof MessageElement.fields>;
export type MessageElementEncoded = InferProtoModelInput<typeof MessageElement.fields>;
