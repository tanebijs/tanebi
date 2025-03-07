import { Bot, eventsDX } from '@/index';
import { BotContact, BotFriend, BotGroup, BotMsgBubble, BotMsgImage, BotMsgLightApp, eventsFDX, eventsGDX } from '@/entity';
import { MessageType } from '@/internal/message';
import { IncomingMessage } from '@/internal/message/incoming';
import { EventEmitter } from 'node:events';
import { BotGroupInvitationRequest } from '@/entity/request/BotGroupInvitationRequest';

export const rawMessage = Symbol('Raw elements');

export type DispatchedMessageBody = {
    type: 'bubble',
    content: BotMsgBubble,
} | {
    type: 'image',
    content: BotMsgImage,
} | {
    type: 'lightApp',
    content: BotMsgLightApp,
};

export type DispatchedMessage = DispatchedMessageBody & {
    [rawMessage]: IncomingMessage,
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

        const message = await this.create(incoming, contact);
        if (!message) {
            return;
        }
        await this.dispatch(message, incoming, contact);
    }

    async create(incoming: IncomingMessage, contact: BotContact): Promise<DispatchedMessageBody | undefined> {
        const segments = incoming.segments;
        const firstSegment = segments[0];

        if (segments.length === 1) {
            if (firstSegment.type === 'image') {
                return {
                    type: 'image',
                    content: await BotMsgImage.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'lightApp') {
                if (firstSegment.app === 'com.tencent.qun.invite' && contact instanceof BotFriend) {
                    this.bot[eventsDX].emit('groupInvitationRequest',
                        await BotGroupInvitationRequest.create(contact, firstSegment));
                }
                return {
                    type: 'lightApp',
                    content: new BotMsgLightApp(firstSegment.app, firstSegment.payload),
                };
            }
        }

        if (firstSegment.type === 'text' || firstSegment.type === 'mention' || firstSegment.type === 'image') {
            return {
                type: 'bubble',
                content: await BotMsgBubble.create(segments, contact, incoming, this.bot),
            };
        }
    }

    async dispatch(message: DispatchedMessageBody, raw: IncomingMessage, contact: BotContact) {
        this.global.emit('message', {
            contact,
            senderUin: raw.senderUin,
            sequence: raw.sequence,
            repliedSequence: raw.repliedSequence,
            [rawMessage]: raw,
            messageUid: raw.msgUid ?? 0n,
            ...message,
        });

        if (contact instanceof BotFriend) {
            contact[eventsFDX].emit('message',{
                sequence: raw.sequence,
                isSelf: raw.senderUin === this.bot.uin,
                repliedSequence: raw.repliedSequence,
                [rawMessage]: raw,
                messageUid: raw.msgUid ?? 0n,
                ...message,
            });
        } else if (contact instanceof BotGroup) {
            const sender = await contact.getMember(raw.senderUin);
            if (sender) {
                contact[eventsGDX].emit('message', {
                    sequence: raw.sequence,
                    sender,
                    repliedSequence: raw.repliedSequence,
                    [rawMessage]: raw,
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

    private async handleLightApp() {

    }
}
