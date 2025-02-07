import { BotContext } from '@/core';
import { PbSendMsg } from '@/core/packet/message/PbSendMsg';
import { timestamp } from '@/core/util/format';
import { randomInt } from '@/core/util/random';
import { MessageType } from '@/core/message';
import { outgoingSegments } from '@/core/message/outgoing/segment-base';

interface OutgoingMessageBase {
    type: MessageType;
    segments: (Exclude<Parameters<typeof outgoingSegments.build>[0], undefined>)[];
    clientSequence: number;
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
    for (const segment of message.segments) {
        const element = outgoingSegments.build(segment);
        if (element) {
            result.body!.richText!.elements!.push(element);
        }
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
