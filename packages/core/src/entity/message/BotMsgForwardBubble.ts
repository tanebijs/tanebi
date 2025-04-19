import { Bot, faceCache } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegment } from '@/internal/message/incoming';
import { BotMsgImage, BotMsgType } from '.';

export class BotMsgForwardBubble implements BotMsgType {
    private constructor(public readonly segments: ForwardedBubbleSegment[]) {}

    static async create(data: IncomingSegment[], msg: IncomingMessage, parentMsgType: MessageType, bot: Bot) {
        return new BotMsgForwardBubble((await Promise.all(
            data.map(async (element): Promise<ForwardedBubbleSegment | undefined> => {
                if (element.type === 'text') {
                    return element;
                } else if (element.type === 'face') {
                    return {
                        type: 'face',
                        faceId: element.faceId,
                        summary: element.summary ?? bot[faceCache].get(String(element.faceId))?.qDes ?? '[表情]',
                        isInLargeCategory: element.isInLargeCategory,
                    };
                } else if (element.type === 'mention') {
                    return {
                        type: 'mention',
                        uin: element.uin,
                        name: element.name,
                    };
                } else if (element.type === 'image') {
                    return {
                        type: 'image',
                        content: await BotMsgImage.createForward(element, parentMsgType, bot),
                    };
                }
            }),
        )).filter((e) => e !== undefined));
    }

    toPreviewString() {
        return this.segments.map((segment) => {
            if (segment.type === 'text') {
                return segment.content;
            } else if (segment.type === 'face') {
                return segment.summary;
            } else if (segment.type === 'mention') {
                return `@${segment.name}`;
            } else if (segment.type === 'mentionAll') {
                return '@全体成员';
            } else if (segment.type === 'image') {
                return '[图片]';
            }
        }).join('');
    }
}

export type ForwardedBubbleSegment =
    | { type: 'text'; content: string; }
    | { type: 'face'; faceId: number; summary: string; isInLargeCategory: boolean; }
    | { type: 'mention'; uin: number; name: string; }
    | { type: 'mentionAll'; }
    | { type: 'image'; content: BotMsgImage; };
