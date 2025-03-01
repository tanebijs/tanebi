import { Bot } from '@/app';
import { BotContact, BotFriend, BotGroup, BotMsgBubble, BotMsgImage } from '@/app/entity';
import { MessageElementDecoded, MessageType } from '@/core/message';
import { IncomingMessage, PrivateMessage } from '@/core/message/incoming';
import { EventEmitter } from 'node:events';

export type DispatchedMessageBody = {
    type: 'bubble',
    content: BotMsgBubble,
} | {
    type: 'image',
    content: BotMsgImage,
};

export type DispatchedMessage = DispatchedMessageBody & {
    internalElems: MessageElementDecoded[],
    messageUid: bigint,
};

export type GlobalMessage = {
    contact: BotContact,
    senderUin: number,
    sequence: number,
    repliedSequence?: number,
} & DispatchedMessage;

export class MessageDispatcher {
    public readonly global = new EventEmitter<{
        message: [GlobalMessage];
    }>();

    constructor(public readonly bot: Bot) {}

    async emit(incoming: IncomingMessage) {
        const contact = await this.resolveContact(incoming);
        if (!contact) {
            return;
        }

        if (incoming.segments.length === 0) {
            return;
        }

        const segments = incoming.segments;
        const firstSegment = segments[0];

        if (segments.length === 1) {
            if (firstSegment.type === 'image') {
                await this.dispatch({
                    type: 'image',
                    content: await BotMsgImage.create(firstSegment, incoming, this.bot),
                }, incoming, contact);
                return;
            }
        }

        if (firstSegment.type === 'text' || firstSegment.type === 'mention' || firstSegment.type === 'image') {
            await this.dispatch({
                type: 'bubble',
                content: await BotMsgBubble.create(segments, contact, incoming, this.bot),
            }, incoming, contact);
        }
    }

    async dispatch(message: DispatchedMessageBody, raw: IncomingMessage, contact: BotContact) {
        this.global.emit('message', {
            contact,
            senderUin: raw.senderUin,
            sequence: raw.sequence,
            repliedSequence: raw.repliedSequence,
            internalElems: raw.internalElems,
            messageUid: raw.msgUid ?? 0n,
            ...message,
        });

        if (contact instanceof BotFriend) {
            contact.dispatchMessage({
                sequence: raw.sequence,
                clientSequence: (<PrivateMessage>raw).clientSequence,
                isSelf: raw.senderUin === this.bot.uin,
                repliedSequence: raw.repliedSequence,
                internalElems: raw.internalElems,
                messageUid: raw.msgUid ?? 0n,
                ...message,
            });
        } else if (contact instanceof BotGroup) {
            const sender = await contact.getMember(raw.senderUin);
            if (sender) {
                contact.eventsDX.emit('message', {
                    sequence: raw.sequence,
                    sender,
                    repliedSequence: raw.repliedSequence,
                    internalElems: raw.internalElems,
                    messageUid: raw.msgUid ?? 0n,
                    ...message,
                });
            }
        }
    }

    private async resolveContact(incoming: IncomingMessage) {
        let contact: BotContact | undefined;
        contact = await (incoming.type === MessageType.PrivateMessage ?
            this.bot.getFriend(incoming.senderUin === this.bot.uin ?
                incoming.targetUin :
                incoming.senderUin) :
            this.bot.getGroup(incoming.groupUin));
        if (!contact) {
            contact = await (incoming.type === MessageType.PrivateMessage ?
                this.bot.getFriend(incoming.senderUin === this.bot.uin ?
                    incoming.targetUin :
                    incoming.senderUin, true) :
                this.bot.getGroup(incoming.groupUin, true));
        }
        return contact;
    }
}
