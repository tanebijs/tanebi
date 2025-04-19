import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_leave = defineAction(
    'set_group_leave',
    z.object({
        group_id: zOneBotInputUin,
        is_dismiss: z.boolean().default(false),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        await group.leave();
        return Ok();
    },
);
