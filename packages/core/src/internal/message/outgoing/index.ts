import { BotContext } from '@/internal';
import { PbSendMsg } from '@/internal/packet/message/PbSendMsg';
import { timestamp } from '@/internal/util/format';
import { MessageElementDecoded, MessageType } from '@/internal/message';
import { OutgoingSegmentCollection } from '@/internal/message/outgoing/segment-base';
import { mentionBuilder } from '@/internal/message/outgoing/segment/mention';
import { textBuilder } from '@/internal/message/outgoing/segment/text';
import { imageBuilder } from '@/internal/message/outgoing/segment/image';

const outgoingSegments = new OutgoingSegmentCollection([
    textBuilder,
    mentionBuilder,
    imageBuilder,
]);

export type OutgoingSegment = Exclude<Parameters<typeof outgoingSegments.build>[0], undefined>;
export type OutgoingSegmentOf<T extends OutgoingSegment['type']> = Extract<OutgoingSegment, { type: T }>;

interface OutgoingMessageBase {
    type: MessageType;
    segments: OutgoingSegment[];
    clientSequence: number;
    random: number;
    reply?: {
        sequence: number;
        senderUin: number;
        senderUid: string;
        messageUid: bigint;
        elements: MessageElementDecoded[];
    }
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

export function buildPbSendMsg(ctx: BotContext, message: OutgoingMessage): Parameters<typeof PbSendMsg.encode>[0] {
    const result = buildPbSendMsgBase(message);
    if (message.reply) {
        result.body!.richText!.elements!.push(message.type === MessageType.PrivateMessage ?
            buildPrivateReply(message.reply, message.repliedClientSequence!) :
            buildGroupReply(message.reply));
    }
    for (const segment of message.segments) {
        const element = outgoingSegments.build(segment, message, ctx);
        result.body!.richText!.elements!.push(...element);
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
