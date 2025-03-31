import { z } from 'zod';

export const zUin = z.number().int().positive();
export const zOneBotInputUin = z.union([zUin, z.string().transform(Number).pipe(zUin)]);

export const zMessageId = z.number().int().positive();
export const zOneBotInputMessageId = z.union([zMessageId, z.string().transform(Number).pipe(zMessageId)]);

export const zOneBotInputUrl = z.union([
    z.object({ file: z.string() }),
    z.object({ url: z.string() }),
    z.object({ path: z.string() }),
]).transform((payload) => {
    if ('file' in payload) {
        return payload;
    } else if ('url' in payload) {
        return { file: payload.url };
    } else {
        return { file: payload.path };
    }
});

export const zOneBotInputBoolean = z.union([
    z.boolean(),
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
    z.literal('0').transform(() => false),
    z.literal('1').transform(() => true),
    z.literal(0).transform(() => false),
    z.literal(1).transform(() => true),
]);