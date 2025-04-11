import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_admin = defineAction(
    'set_group_admin',
    z.object({
        group_id: zOneBotInputUin,
        user_id: zOneBotInputUin,
        enable: zOneBotInputBoolean.default(true),
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
        await member.setAdmin(payload.enable);
        return Ok();
    }
);