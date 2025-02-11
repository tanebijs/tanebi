import { Bot } from '@/app';
import { BotContact, BotFriend, BotGroup } from '@/app/entity';
import { BotMsgBubble, BotMsgImage } from '@/app/message/incoming';
import { MessageType } from '@/core/message';
import { IncomingMessage } from '@/core/message/incoming';

export class MessageDispatcher {
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
                    content: await BotMsgImage.create(firstSegment),
                }, incoming, contact);
                return;
            }
        }

        if (firstSegment.type === 'text' || firstSegment.type === 'mention' || firstSegment.type === 'image') {
            await this.dispatch({
                type: 'bubble',
                content: await BotMsgBubble.create(segments, contact),
            }, incoming, contact);
        }
    }

    async dispatch(message: DispatchedMessage, raw: IncomingMessage, contact: BotContact) {
        if (contact instanceof BotFriend) {
            contact.dispatchMessage(
                message,
                raw.senderUin === this.bot.uin,
                raw.sequence,
            );
        } else if (contact instanceof BotGroup) {
            const sender = await contact.getMember(raw.senderUin);
            if (sender) {
                contact.dispatchMessage(message, sender, raw.sequence);
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

export type DispatchedMessage = {
    type: 'bubble',
    content: BotMsgBubble,
} | {
    type: 'image',
    content: BotMsgImage,
};