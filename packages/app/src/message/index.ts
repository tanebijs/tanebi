import { decodeCQCode } from '@/message/cqcode';
import { zOneBotSendSegment } from '@/message/segment';
import { z } from 'zod';

export const zOneBotInputSegments = z.union([
    z.string().transform(decodeCQCode),
    zOneBotSendSegment.transform((segment) => [segment]),
    z.array(zOneBotSendSegment),
]);
