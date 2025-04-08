import { BotMsgForwardPack } from 'tanebi';
import { defineAction, Ok } from '@app/action';
import { decodeForwardId, transformGetForwardMessageBody } from '@app/message/transform/forward';
import { z } from 'zod';
import { OneBotRecvNodeSegment } from '@app/message/segment';
import { encodeCQCode } from '@app/message/cqcode';

export const get_forward_msg = defineAction(
    'get_forward_msg',
    z.union([
        z.object({
            id: z.string(),
            // Standard OneBot API flavor
            // the return value is { message: [...] }
        }),
        z.object({
            message_id: z.string(),
            // GoCQ API flavor, the message_id is actually the forward_id
            // the return value is { messages: [...] }
        })
    ]),
    async (ctx, payload) => {
        let forwardId: string;
        let useGoCQApiFlavor: boolean;
        if ('id' in payload) {
            forwardId = payload.id;
            useGoCQApiFlavor = false;
        } else {
            forwardId = payload.message_id;
            useGoCQApiFlavor = true;
        }

        const { type, senderUid, resId } = decodeForwardId(forwardId);
        const downloadedMsgs = await new BotMsgForwardPack(
            type,
            senderUid,
            {
                type: 'forward',
                resId,
                recursiveCount: 0, // dummy, not used
                preview: [], // dummy, not used
            },
            ctx.bot,
        ).download();
        const messages = downloadedMsgs.map<OneBotRecvNodeSegment>((msg) => ({
            type: 'node',
            data: {
                user_id: msg.senderUin,
                uin: msg.senderUin,
                name: msg.senderName,
                content: ctx.config.messageReportType === 'array' ?
                    transformGetForwardMessageBody(msg) :
                    transformGetForwardMessageBody(msg).map(encodeCQCode).join(''),
            }
        }));
        return Ok(
            useGoCQApiFlavor ?
                { messages } :
                { message: messages }
        );
    }
);