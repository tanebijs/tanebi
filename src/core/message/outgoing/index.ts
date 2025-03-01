import { BotContext } from '@/core';
import { PbSendMsg } from '@/core/packet/message/PbSendMsg';
import { timestamp } from '@/core/util/format';
import { randomInt } from '@/core/util/random';
import { MessageElementDecoded, MessageType } from '@/core/message';
import { OutgoingSegmentCollection } from '@/core/message/outgoing/segment-base';
import { mentionBuilder } from '@/core/message/outgoing/segment/mention';
import { textBuilder } from '@/core/message/outgoing/segment/text';
import { imageBuilder } from '@/core/message/outgoing/segment/image';

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
}

export interface OutgoingGroupMessage extends OutgoingMessageBase {
    type: MessageType.GroupMessage;
    groupUin: number;
}

export type OutgoingMessage = OutgoingPrivateMessage | OutgoingGroupMessage;

export function buildPbSendMsg(ctx: BotContext, message: OutgoingMessage): Parameters<typeof PbSendMsg.encode>[0] {
    const result = buildPbSendMsgBase(message);
    if (message.reply) {
        result.body!.richText!.elements!.push(buildReply(message.reply));
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
        random: randomInt(0, 4294967295),
        control: message.type === MessageType.PrivateMessage ? { msgFlag: timestamp() } : undefined,
    };
}

function buildReply(reply: Exclude<OutgoingMessage['reply'], undefined>): MessageElementDecoded {
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
