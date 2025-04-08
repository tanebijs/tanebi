import { z } from 'zod';

export const zPositiveInteger = z.number().int().positive();
export const zInputPositiveInteger = z.union([zPositiveInteger, z.string().transform(Number).pipe(zPositiveInteger)]);

export const zUin = zPositiveInteger;
export const zOneBotInputUin = zInputPositiveInteger;

export const zMessageId = zPositiveInteger;
export const zOneBotInputMessageId = zInputPositiveInteger;

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