import { resolveOneBotFile } from '@app/common/download';
import { OneBotApp } from '@app/index';
import { zOneBotBubbleSegment } from '@app/message';
import { decodeCQCode } from '@app/message/cqcode';
import { OneBotRecvSegment, OneBotSendNodeSegment, zOneBotSendNodeSegment } from '@app/message/segment';
import { transformRecvMessage, transformRecvMessageBody } from '@app/message/transform/recv';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import {
    dispatcher,
    ForwardedMessage,
    ForwardedMessageBuilder,
    ForwardedMessagePacker,
    MessageType,
    parsePushMsgBody,
} from 'tanebi';
import { z } from 'zod';

export const zOneBotSendNodeContent = z.union([
    z.array(zOneBotBubbleSegment).min(1),
    z.array(zOneBotSendNodeSegment).min(1),
]);
export type OneBotSendNodeContent = z.infer<typeof zOneBotSendNodeContent>;

export const zOneBotInputSendNodeContent = z.union([
    z.string().transform(decodeCQCode).pipe(zOneBotSendNodeContent),
    zOneBotSendNodeContent,
]);

export async function transformForwardMessages(
    ctx: OneBotApp,
    p: ForwardedMessagePacker,
    messages: OneBotSendNodeSegment[],
) {
    for (const { data } of messages) {
        if ('id' in data) {
            const message = await ctx.storage.getById(data.id);
            if (!message) {
                throw new Error(`Message not found: ${data.id}`);
            }
            if (message.storeType === MessageStoreType.OutgoingMessageStore) {
                const json = JSON.parse(OutgoingMessageStore.decode(message.body).jsonElem);
                await p.fake(ctx.bot.uin, ctx.bot.name, async (b) => {
                    await transformNode(ctx, b, zOneBotSendNodeContent.parse(json));
                });
            } else {
                const restored = parsePushMsgBody(message.body);
                const contact = await ctx.bot[dispatcher].resolveContact(restored);
                if (!contact) {
                    throw new Error(`Contact not found: ${restored.senderUin}`);
                }
                const dispatched = await ctx.bot[dispatcher].create(restored, contact);
                if (!dispatched) {
                    throw new Error(`Message type not supported: ${restored.type}`);
                }
                const transformed = await transformRecvMessage(
                    ctx,
                    message.type,
                    message.peerUin,
                    dispatched,
                    restored.repliedSequence,
                );
                await p.fake(restored.senderUin, restored.senderName, async (b) => {
                    await transformNode(ctx, b, zOneBotSendNodeContent.parse(transformed));
                });
            }
        } else {
            const uin = data.user_id ?? data.uin ?? ctx.bot.uin;
            await p.fake(uin, data.name, async (b) => {
                await transformNode(ctx, b, zOneBotInputSendNodeContent.parse(data.content));
            });
        }
    }
}

export async function transformNode(ctx: OneBotApp, b: ForwardedMessageBuilder, segments: OneBotSendNodeContent) {
    if (segments[0].type === 'node') {
        await b.forward(async (p) => {
            await transformForwardMessages(ctx, p, segments as OneBotSendNodeSegment[]);
        });
    } else {
        for (const segment of segments) {
            if (segment.type === 'text') {
                b.text(segment.data.text);
            } else if (segment.type === 'image') {
                const image = await resolveOneBotFile(ctx, segment.data);
                await b.image(image, segment.data.sub_type, segment.data.summary);
            } else if (segment.type === 'face') {
                b.face(segment.data.id);
            } else if (segment.type === 'at') {
                ctx.logger.warn('At segment is not supported in forwarded messages, using text as fallback', {
                    module: 'SendForwardMsg',
                });
                b.text(`@${segment.data.name || segment.data.qq}`);
            }
        }
    }
}

export function transformGetForwardMessageBody(msg: ForwardedMessage): OneBotRecvSegment[] {
    if (msg.type === 'bubble') {
        return msg.content.segments.map<OneBotRecvSegment>((s) => {
            if (s.type === 'text') {
                return { type: 'text', data: { text: s.content } };
            } else if (s.type === 'mention') {
                return { type: 'at', data: { qq: s.uin, name: s.name } };
            } else if (s.type === 'mentionAll') {
                return { type: 'at', data: { qq: 'all' } };
            } else if (s.type === 'image') {
                return {
                    type: 'image',
                    data: {
                        file: s.content.url,
                        url: s.content.url,
                        sub_type: s.content.subType,
                        summary: s.content.summary,
                    },
                };
            } else {
                // s.type === 'face'
                return { type: 'face', data: { id: '' + s.faceId } };
            }
        });
    } else {
        return transformRecvMessageBody(msg);
    }
}

export function encodeForwardId(type: MessageType, senderUid: string, resId: string) {
    return `${type}:${senderUid}:${resId}`;
}

export function decodeForwardId(forwardId: string) {
    const [type, senderUid, resId] = forwardId.split(':');
    return {
        type: parseInt(type) as MessageType,
        senderUid,
        resId,
    };
}
