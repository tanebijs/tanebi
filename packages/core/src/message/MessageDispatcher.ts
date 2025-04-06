import { Bot, eventsDX } from '@/index';
import {
    BotContact,
    BotFriend,
    BotFriendMessage,
    BotGroup,
    BotGroupInvitationRequest,
    BotGroupMember,
    BotGroupMessage,
    BotMsgBubble,
    BotMsgForwardPack,
    BotMsgImage,
    BotMsgLightApp,
    BotMsgRecord,
    BotMsgVideo,
    eventsFDX,
    eventsGDX,
} from '@/entity';
import { MessageType } from '@/internal/message';
import { blob, GroupMessage, IncomingMessage, msgUid, PrivateMessage, rawElems } from '@/internal/message/incoming';
import { EventEmitter } from 'node:events';

export const rawMessage = Symbol('Raw message');

export type DispatchedMessageBody =
    | {
          type: 'bubble';
          content: BotMsgBubble;
      }
    | {
          type: 'image';
          content: BotMsgImage;
      }
    | {
          type: 'record';
          content: BotMsgRecord;
      }
    | {
          type: 'video';
          content: BotMsgVideo;
      }
    | {
          type: 'forward';
          content: BotMsgForwardPack;
      }
    | {
          type: 'lightApp';
          content: BotMsgLightApp;
      };

export type DispatchedMessage = DispatchedMessageBody & {
    messageUid: bigint;
};

export class MessageDispatcher {
    public readonly global = new EventEmitter<{
        private: [BotFriend, BotFriendMessage];
        group: [BotGroup, BotGroupMember, BotGroupMessage];
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

            if (firstSegment.type === 'record') {
                return {
                    type: 'record',
                    content: await BotMsgRecord.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'video') {
                return {
                    type: 'video',
                    content: await BotMsgVideo.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'forward') {
                return {
                    type: 'forward',
                    content: new BotMsgForwardPack(incoming.type, incoming.senderUid!, firstSegment, this.bot),
                };
            }

            if (firstSegment.type === 'lightApp') {
                if (firstSegment.app === 'com.tencent.qun.invite' && contact instanceof BotFriend) {
                    this.bot[eventsDX].emit(
                        'groupInvitationRequest',
                        await BotGroupInvitationRequest.create(contact, firstSegment, this.bot)
                    );
                }
                return {
                    type: 'lightApp',
                    content: new BotMsgLightApp(firstSegment.app, firstSegment.payload),
                };
            }
        }

        if (
            firstSegment.type === 'text' ||
            firstSegment.type === 'face' ||
            firstSegment.type === 'mention' ||
            firstSegment.type === 'image'
        ) {
            return {
                type: 'bubble',
                content: await BotMsgBubble.create(segments, contact, incoming, this.bot),
            };
        }
    }

    async dispatch(message: DispatchedMessageBody, raw: IncomingMessage, contact: BotContact) {
        if (contact instanceof BotFriend) {
            const friendMessage: BotFriendMessage = {
                sequence: raw.sequence,
                isSelf: raw.senderUin === this.bot.uin,
                repliedSequence: raw.repliedSequence,
                [rawMessage]: raw as PrivateMessage,
                messageUid: raw[msgUid],
                ...message,
            };
            contact[eventsFDX].emit('message', friendMessage);
            this.global.emit('private', contact, friendMessage);
        } else if (contact instanceof BotGroup) {
            const sender = await contact.getMember(raw.senderUin);
            if (sender) {
                const groupMessage: BotGroupMessage = {
                    sequence: raw.sequence,
                    sender,
                    repliedSequence: raw.repliedSequence,
                    [rawMessage]: raw as GroupMessage,
                    messageUid: raw[msgUid],
                    ...message,
                };
                contact[eventsGDX].emit('message', groupMessage);
                this.global.emit('group', contact, sender, groupMessage);
            }
        }
    }

    async resolveContact(incoming: IncomingMessage) {
        let contact: BotContact | undefined;
        contact = await (incoming.type === MessageType.PrivateMessage
            ? this.bot.getFriend(incoming.senderUin === this.bot.uin ? incoming.targetUin : incoming.senderUin)
            : this.bot.getGroup(incoming.groupUin));
        if (!contact) {
            contact = await (incoming.type === MessageType.PrivateMessage
                ? this.bot.getFriend(
                    incoming.senderUin === this.bot.uin ? incoming.targetUin : incoming.senderUin,
                    true
                )
                : this.bot.getGroup(incoming.groupUin, true));
        }
        return contact;
    }

    private async handleLightApp() {}
}

export { MessageType };
export { rawElems, msgUid, blob };
