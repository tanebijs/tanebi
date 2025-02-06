import { PushMsgBody } from '@/core/packet/message/PushMsg';
import { MessageElement } from '@/core/packet/message/MessageElement';
import { parseMetadata } from '@/message/metadata';
import { incomingSegments } from '@/message/incoming/base';

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
    segments: (Exclude<ReturnType<typeof incomingSegments.parse>, undefined>)[];
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
    if (pushMsg.body?.richText?.elements) {
        result.segments = pushMsg.body.richText.elements
            .map((elem) => incomingSegments.parse(elem))
            .filter((segment): segment is Exclude<typeof segment, undefined> => segment !== undefined);
    }
    return result;
}