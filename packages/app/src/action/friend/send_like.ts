import { defineAction, Failed, Ok } from '@app/action';
import { zInputPositiveInteger, zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const send_like = defineAction(
    'send_like',
    z.object({
        user_id: zOneBotInputUin,
        count: zInputPositiveInteger.default(1),
        group_id: zOneBotInputUin.optional(),
    }),
    async (ctx, payload) => {
        try {
            await ctx.bot.sendProfileLike(payload.user_id, payload.count, payload.group_id);
        } catch (e) {
            if (e instanceof Error && e.message.startsWith('Failed to resolve')) {
                return Failed(404, 'User not found');
            }
            throw e;
        }
        return Ok();
    },
);