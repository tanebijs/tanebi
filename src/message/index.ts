import { PushMsgBody } from '@/core/packet/message/PushMsg';
import { MessageElement } from '@/core/packet/message/MessageElement';
import { parseMetadata } from '@/message/metadata';

export enum MessageType {
    PrivateMessage = 1,
    GroupMessage = 2,
}

interface MessageBase {
    type: MessageType;
    senderUin: number;
    targetUin: number;
    senderUid?: string;
    sequence: number;
    segments: string[]; // TODO: parse segments
    internalElems?: ReturnType<typeof MessageElement.decode>[];
    msgUid?: bigint;
}

export interface PrivateMessage extends MessageBase {
    type: MessageType.PrivateMessage;
    targetUid?: string;
    clientSequence: number;
    isTemporary: boolean;
}

export interface GroupMessage extends MessageBase {
    type: MessageType.GroupMessage;
    groupUin: number;
}

export type MessageChain = PrivateMessage | GroupMessage;

export function parsePushMsgBody(pushMsg: ReturnType<typeof PushMsgBody.decode>): MessageChain {
    const result = parseMetadata(pushMsg);
    // TODO: parse segments
    return result;
}