import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_special_title = defineAction(
    'set_group_special_title',
    z.object({
        group_id: zOneBotInputUin,
        user_id: zOneBotInputUin,
        special_title: z.string().default(''),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        const member = await group.getMember(payload.user_id);
        if (!member) {
            return Failed(404, 'Member not found');
        }
        await member.setSpecialTitle(payload.special_title);
        return Ok();
    },
);
