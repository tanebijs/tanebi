import { z } from 'zod';

export const zUin = z.number().int().positive();
export const zOneBotInputUin = z.union([zUin, z.string().transform(Number).pipe(zUin)]);

export const zMessageId = z.number().int().positive();
export const zOneBotInputMessageId = z.union([zMessageId, z.string().transform(Number).pipe(zMessageId)]);

export const zOneBotInputBoolean = z.union([
    z.boolean(),
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
    z.literal('0').transform(() => false),
    z.literal('1').transform(() => true),
    z.literal(0).transform(() => false),
    z.literal(1).transform(() => true),
]);