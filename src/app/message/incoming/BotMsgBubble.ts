import { BotContact, BotGroup, BotGroupMember } from '@/app/entity';
import { BotMsgImage } from '@/app/message/incoming';
import { IncomingSegment } from '@/core/message/incoming';

export class BotMsgBubble {
    private constructor(public readonly segments: BubbleSegment[]) {}

    static async create(data: IncomingSegment[], peer: BotContact) {
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
                            return { type: 'image', content: await BotMsgImage.create(element) };
                        }
                        // TODO: warn about unknown type
                    })
                )
            ).filter((e) => e !== undefined)
        );
    }
}

export type BubbleSegment =
    | { type: 'text'; content: string }
    | { type: 'mention'; mentioned: BotGroupMember }
    | { type: 'mentionAll' }
    | { type: 'image'; content: BotMsgImage };
