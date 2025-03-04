import { PushMsgBody, PushMsgType } from '@/internal/packet/message/PushMsg';
import { MessageElementDecoded, MessageType } from '@/internal/message';
import { IncomingSegmentCollection } from '@/internal/message/incoming/segment-base';
import { imageCommonParser, imageNotOnlineParser, imageCustomFaceParser } from '@/internal/message/incoming/segment/image';
import { mentionParser } from '@/internal/message/incoming/segment/mention';
import { textParser } from '@/internal/message/incoming/segment/text';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';

const incomingSegments = new IncomingSegmentCollection([
    textParser,
    mentionParser,
    imageCommonParser,
    imageNotOnlineParser,
    imageCustomFaceParser,
]);

export type IncomingSegment = Exclude<ReturnType<typeof incomingSegments.parse>, undefined>;
export type IncomingSegmentOf<T extends IncomingSegment['type']> = Extract<IncomingSegment, { type: T }>;

interface MessageBase {
    type: MessageType;
    senderUin: number;
    targetUin: number;
    senderUid?: string;
    sequence: number;
    repliedSequence?: number;
    segments: IncomingSegment[];
    rawElems: MessageElementDecoded[];
    msgUid?: bigint;
}

export interface PrivateMessage extends MessageBase {
    type: MessageType.PrivateMessage;
    targetUid?: string;
    clientSequence: number;
    random: number;
    isTemporary: boolean;
}

export interface GroupMessage extends MessageBase {
    type: MessageType.GroupMessage;
    groupUin: number;
}

export type IncomingMessage = PrivateMessage | GroupMessage;

export function parsePushMsgBody(pushMsg: NapProtoDecodeStructType<typeof PushMsgBody.fields>): IncomingMessage {
    const result = parseMetadata(pushMsg);
    if (pushMsg.body?.richText?.elements) {
        for (const element of pushMsg.body.richText.elements) {
            if (!result.repliedSequence && element.srcMsg) {
                result.repliedSequence = element.srcMsg.pbReserve?.friendSequence // for private message
                    ?? element.srcMsg.origSeqs?.[0]; // for group message
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

function parseMetadata(pushMsg: NapProtoDecodeStructType<typeof PushMsgBody.fields>): IncomingMessage {
    if (!pushMsg.responseHead.groupExt) {
        return {
            type: MessageType.PrivateMessage,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            targetUid: pushMsg.responseHead.toUid,
            sequence: pushMsg.contentHead.ntMsgSeq ?? 0,
            segments: [],
            rawElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,

            clientSequence: pushMsg.contentHead.sequence ?? 0,
            random: pushMsg.contentHead.random ?? 0,
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
            rawElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,
        };
    }
}