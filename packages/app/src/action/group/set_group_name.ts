import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_name = defineAction(
    'set_group_name',
    z.object({
        group_id: zOneBotInputUin,
        group_name: z.string(),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        await group.setName(payload.group_name);
        return Ok();
    },
);
