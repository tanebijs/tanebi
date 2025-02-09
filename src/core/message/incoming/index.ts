import { PushMsgBody, PushMsgType } from '@/core/packet/message/PushMsg';
import { incomingSegments } from '@/core/message/incoming/segment-base';
import { MessageElementDecoded, MessageType } from '@/core/message';

export type IncomingSegment = Exclude<ReturnType<typeof incomingSegments.parse>, undefined>;

interface MessageBase {
    type: MessageType;
    senderUin: number;
    targetUin: number;
    senderUid?: string;
    sequence: number;
    repliedSequence?: number;
    segments: IncomingSegment[];
    internalElems?: MessageElementDecoded[];
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

function parseMetadata(pushMsg: ReturnType<typeof PushMsgBody.decode>): MessageChain {
    if (!pushMsg.responseHead.groupExt) {
        return {
            type: MessageType.PrivateMessage,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            targetUid: pushMsg.responseHead.toUid,
            sequence: pushMsg.contentHead.ntMsgSeq ?? 0,
            segments: [],
            internalElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,

            clientSequence: pushMsg.contentHead.sequence ?? 0,
            isTemporary: pushMsg.contentHead.type === PushMsgType.TempMessage,
        };
    } else {
        return {
            type: MessageType.GroupMessage,

            groupUin: pushMsg.responseHead.groupExt.groupUin,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            sequence: pushMsg.contentHead.sequence ?? 0,
            segments: [],
            internalElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,
        };
    }
}