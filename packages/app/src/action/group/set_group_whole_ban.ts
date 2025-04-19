import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_whole_ban = defineAction(
    'set_group_whole_ban',
    z.object({
        group_id: zOneBotInputUin,
        enable: zOneBotInputBoolean.default(true),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        await group.setMuteAll(payload.enable);
        return Ok();
    },
);
