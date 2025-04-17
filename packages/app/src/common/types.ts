import { z } from 'zod';

export const zPositiveInteger = z.number().int().positive();
export const zInputPositiveInteger = z.union([zPositiveInteger, z.string().transform(Number).pipe(zPositiveInteger)]);

export const zNonNegativeInteger = z.number().int().nonnegative();
export const zInputNonNegativeInteger = z.union([zNonNegativeInteger, z.string().transform(Number).pipe(zNonNegativeInteger)]);

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
    z.literal('no').transform(() => false),
    z.literal('yes').transform(() => true),
]);

export const zWebSocketInputData = z.object({
    action: z.string(),
    params: z.unknown(),
    echo: z.string(), 
});
