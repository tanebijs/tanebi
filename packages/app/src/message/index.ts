import { decodeCQCode } from '@app/message/cqcode';
import {
    OneBotSendSegment,
    zOneBotFaceSegment,
    zOneBotPokeSegment,
    zOneBotReplySegment,
    zOneBotSendAtSegment,
    zOneBotSendImageSegment,
    zOneBotSendNodeSegment,
    zOneBotSendRecordSegment,
    zOneBotTextSegment,
} from '@app/message/segment';
import { z } from 'zod';

export const zOneBotValidSegmentCombination = z.union([
    z.array(
        z.discriminatedUnion('type', [
            zOneBotTextSegment,
            zOneBotFaceSegment,
            zOneBotSendAtSegment,
            zOneBotSendImageSegment,
            zOneBotReplySegment,
        ])
    ).min(1),
    z.tuple([zOneBotSendRecordSegment]),
    z.tuple([zOneBotPokeSegment]),
    z.array(zOneBotSendNodeSegment).min(1),
]);
export type OneBotValidSegmentCombination = z.infer<typeof zOneBotValidSegmentCombination>;

export const zOneBotInputMessage = z
    .object({
        message: z.unknown(),
        auto_escape: z.boolean().default(false),
    })
    .transform<{ message: OneBotSendSegment[]; auto_escape: boolean }>((payload) => {
        let message;
        if (typeof payload.message === 'string') {
            if (payload.auto_escape) {
                message = [{ type: 'text', data: { text: payload.message } }];
            } else {
                message = decodeCQCode(payload.message);
            }
        } else {
            if (Array.isArray(payload.message)) {
                message = payload.message;
            } else {
                message = [payload.message];
            }
        }
        const parsed = zOneBotValidSegmentCombination.parse(message);
        return { message: parsed, auto_escape: payload.auto_escape };
    });
export type OneBotInputMessage = z.infer<typeof zOneBotInputMessage>;