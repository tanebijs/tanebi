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
    repliedSequence?: number;
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
        for (const element of pushMsg.body.richText.elements) {
            if (!result.repliedSequence && element.srcMsg) {
                result.repliedSequence = element.srcMsg.origSeqs?.[0] ?? element.srcMsg.pbReserve?.friendSequence;
                continue;
            }

            const parsed = incomingSegments.parse(element);
            if (parsed) {
                result.segments.push(parsed);
            }
        }
    }

    if (result.repliedSequence && result.type === MessageType.GroupMessage) {
        result.segments = result.segments.slice(2);
        // Remove the first two segments [ mention, text ] which are redundant
    }
    return result;
}