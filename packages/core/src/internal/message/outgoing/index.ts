import { PbSendMsg } from '@/internal/packet/message/PbSendMsg';
import { timestamp } from '@/internal/util/format';
import { MessageElementDecoded, MessageType } from '@/internal/message';
import { OutgoingSegmentCollection } from '@/internal/message/outgoing/segment-base';
import { mentionBuilder } from '@/internal/message/outgoing/segment/mention';
import { textBuilder } from '@/internal/message/outgoing/segment/text';
import { imageBuilder } from '@/internal/message/outgoing/segment/image';
import { faceBuilder } from '@/internal/message/outgoing/segment/face';
import { recordBuilder } from '@/internal/message/outgoing/segment/record';
import { forwardBuilder } from '@/internal/message/outgoing/segment/forward';
import { MessageElement } from '@/internal/packet/message/MessageElement';

const outgoingSegments = new OutgoingSegmentCollection([
    textBuilder,
    mentionBuilder,
    faceBuilder,
    imageBuilder,
    recordBuilder,
    forwardBuilder,
]);

export type OutgoingSegment = Exclude<Parameters<typeof outgoingSegments.build>[0], undefined>;
export type OutgoingSegmentOf<T extends OutgoingSegment['type']> = Extract<OutgoingSegment, { type: T }>;

export const sendBlob = Symbol('Raw PbSendMsg');

export interface ReplyInfo {
    sequence: number;
    senderUin: number;
    senderUid: string;
    messageUid: bigint;
    elements: Uint8Array[];
}

export interface OutgoingMessageBase {
    type: MessageType;
    segments: OutgoingSegment[];
    clientSequence: number;
    random: number;
    reply?: ReplyInfo;
    [sendBlob]?: Uint8Array;
}

export interface OutgoingPrivateMessage extends OutgoingMessageBase {
    type: MessageType.PrivateMessage;
    targetUin: number;
    targetUid?: string;
    repliedClientSequence?: number;
}

export interface OutgoingGroupMessage extends OutgoingMessageBase {
    type: MessageType.GroupMessage;
    groupUin: number;
}

export type OutgoingMessage = OutgoingPrivateMessage | OutgoingGroupMessage;

export function buildPbSendMsg(message: OutgoingMessage): Uint8Array {
    const pbSendMsg = buildPbSendMsgBase(message);
    pbSendMsg.body!.richText!.elements!.push(
        ...buildElements(message).map((element) => MessageElement.encode(element)));
    const result = PbSendMsg.encode(pbSendMsg);
    message[sendBlob] = result;
    return result;
}

export function buildElements(message: OutgoingMessage): MessageElementDecoded[] {
    const result: MessageElementDecoded[] = [];
    if (message.reply) {
        result.push(message.type === MessageType.PrivateMessage ?
            buildPrivateReply(message.reply, message.repliedClientSequence!) :
            buildGroupReply(message.reply));
    }
    for (const segment of message.segments) {
        const element = outgoingSegments.build(segment, message);
        result.push(...element);
    }
    return result;
}

function buildPbSendMsgBase(message: OutgoingMessage): Parameters<typeof PbSendMsg.encode>[0] {
    return {
        routingHead: {
            c2CExt: message.type === MessageType.PrivateMessage ? {
                uin: message.targetUin,
                uid: message.targetUid,
            } : undefined,
            groupExt: message.type === MessageType.GroupMessage ? {
                groupCode: message.groupUin 
            } : undefined,
        },
        contentHead: { type: 1, subType: 0, c2CCmd: 0 },
        body: { richText: { elements: [] } },
        clientSequence: message.clientSequence,
        random: message.random,
        control: message.type === MessageType.PrivateMessage ? { msgFlag: timestamp() } : undefined,
    };
}

function buildPrivateReply(reply: Exclude<OutgoingMessage['reply'], undefined>, seq: number): MessageElementDecoded {
    return {
        srcMsg: {
            origSeqs: [seq],
            senderUin: reply.senderUin,
            time: timestamp(),
            elems: reply.elements,
            pbReserve: {
                messageId: reply.messageUid,
                senderUid: reply.senderUid,
                friendSequence: reply.sequence,
            },
            toUin: 0,
        }
    };
}

function buildGroupReply(reply: Exclude<OutgoingMessage['reply'], undefined>): MessageElementDecoded {
    return {
        srcMsg: {
            origSeqs: [reply.sequence],
            senderUin: reply.senderUin,
            time: timestamp(),
            elems: reply.elements,
            pbReserve: {
                messageId: reply.messageUid,
                senderUid: reply.senderUid,
            },
            toUin: 0,
        }
    };
}
