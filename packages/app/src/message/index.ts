import { decodeCQCode } from '@app/message/cqcode';
import { zOneBotSendSegment } from '@app/message/segment';
import { z } from 'zod';

export const zOneBotInputSegments = z.union([
    z.string().transform(decodeCQCode),
    zOneBotSendSegment.transform((segment) => [segment]),
    z.array(zOneBotSendSegment),
]);
