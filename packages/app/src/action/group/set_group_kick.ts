import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_kick = defineAction(
    'set_group_kick',
    z.object({
        group_id: zOneBotInputUin,
        user_id: zOneBotInputUin,
        reject_add_request: zOneBotInputBoolean.default(false),
        reason: z.string().optional(),
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
        await member.kick(payload.reject_add_request, payload.reason);
        return Ok();
    },
);
