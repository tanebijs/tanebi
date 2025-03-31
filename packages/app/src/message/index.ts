import { decodeCQCode } from '@app/message/cqcode';
import { OneBotSendSegment, zOneBotSendSegment } from '@app/message/segment';
import { z } from 'zod';

export const zOneBotInputSegments = z.union([
    z.string(),
    zOneBotSendSegment.transform((segment) => [segment]),
    z.array(zOneBotSendSegment),
]);

export const zOneBotInputMessage = z.object({
    message: zOneBotInputSegments,
    auto_escape: z.boolean().default(false),
}).transform<{ message: OneBotSendSegment[], auto_escape: boolean }>((payload) => {
    if (typeof payload.message === 'string') {
        if (payload.auto_escape) {
            return {
                message: [{ type: 'text', data: { text: payload.message } }],
                auto_escape: true,
            };
        } else {
            return {
                message: decodeCQCode(payload.message),
                auto_escape: false,
            };
        }
    } else {
        return {
            message: payload.message,
            auto_escape: payload.auto_escape,
        };
    }
});
