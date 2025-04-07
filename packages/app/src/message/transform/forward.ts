import { dispatcher, ForwardedMessageBuilder, ForwardedMessagePacker, ctx as internalCtx, parsePushMsgBody } from 'tanebi';
import { z } from 'zod';
import { OneBotApp } from '@app/index';
import { OneBotSendNodeSegment, zOneBotSendNodeSegment } from '@app/message/segment';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { zOneBotBubbleSegment } from '@app/message';
import { resolveOneBotUrl } from '@app/common/download';
import { transformRecvMessage } from '@app/message/transform/recv';
import { decodeCQCode } from '@app/message/cqcode';

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
    messages: OneBotSendNodeSegment[]
) {
    for (const { data } of messages) {
        if ('id' in data) {
            const message = await ctx.storage.getById(data.id);
            if (!message) {
                throw new Error(`Message not found: ${data.id}`);
            }
            if (message.storeType === MessageStoreType.OutgoingMessageStore) {
                const json = JSON.parse(OutgoingMessageStore.decode(message.body).jsonElem);
                await p.fake(ctx.bot.uin!, ctx.bot[internalCtx].keystore.info.name, async (b) => {
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
                    restored.repliedSequence
                );
                await p.fake(restored.senderUin, restored.senderName, async (b) => {
                    await transformNode(ctx, b, zOneBotSendNodeContent.parse(transformed));
                });
            }
        } else {
            const uin = data.user_id ?? data.uin ?? ctx.bot.uin!;
            await p.fake(uin, data.name, async (b) => {
                await transformNode(ctx, b, zOneBotInputSendNodeContent.parse(data.content));
            });
        }
    }
}

export async function transformNode(
    ctx: OneBotApp,
    b: ForwardedMessageBuilder,
    segments: OneBotSendNodeContent
) {
    if (segments[0].type === 'node') {
        await b.forward(async (p) => {
            await transformForwardMessages(ctx, p, segments as OneBotSendNodeSegment[]);
        });
    } else {
        for (const segment of segments) {
            if (segment.type === 'text') {
                b.text(segment.data.text);
            } else if (segment.type === 'image') {
                const image = await resolveOneBotUrl(segment.data.file);
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
