import { Bot } from '@/app';
import { BotContact, BotGroup, BotGroupMember } from '@/app/entity';
import { BotMsgImage, BotMsgType } from '.';
import { IncomingMessage, IncomingSegment } from '@/core/message/incoming';

export class BotMsgBubble implements BotMsgType {
    private constructor(public readonly segments: BubbleSegment[]) {}

    static async create(data: IncomingSegment[], peer: BotContact, msg: IncomingMessage, bot: Bot) {
        return new BotMsgBubble(
            (
                await Promise.all(
                    data.map<Promise<BubbleSegment | undefined>>(async (element) => {
                        if (element.type === 'text') {
                            return element;
                        } else if (element.type === 'mention') {
                            if (peer instanceof BotGroup) {
                                if (element.uin === 0) {
                                    return { type: 'mentionAll' };
                                } else {
                                    const mentioned = await peer.getMember(element.uin);
                                    if (mentioned)
                                        return {
                                            type: 'mention',
                                            mentioned,
                                        };
                                }
                            }
                            // TODO: warn about mention in private chat
                        } else if (element.type === 'image') {
                            return { type: 'image', content: await BotMsgImage.create(element, msg, bot) };
                        }
                        // TODO: warn about unknown type
                    })
                )
            ).filter((e) => e !== undefined)
        );
    }

    toPreviewString() {
        return this.segments.map((segment) => {
            if (segment.type === 'text') {
                return segment.content;
            } else if (segment.type === 'mention') {
                return `@${segment.mentioned.card || segment.mentioned.nickname}`;
            } else if (segment.type === 'mentionAll') {
                return '@全体成员';
            } else if (segment.type === 'image') {
                return '[图片]';
            }
        }).join('');
    }
}

export type BubbleSegment =
    | { type: 'text'; content: string }
    | { type: 'mention'; mentioned: BotGroupMember }
    | { type: 'mentionAll' }
    | { type: 'image'; content: BotMsgImage };
