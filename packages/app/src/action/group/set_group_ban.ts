import { defineAction, Failed, Ok } from '@app/action';
import { zInputNonNegativeInteger, zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const set_group_ban = defineAction(
    'set_group_ban',
    z.object({
        group_id: zOneBotInputUin,
        user_id: zOneBotInputUin,
        duration: zInputNonNegativeInteger.default(1800),
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
        if (payload.duration > 0) {
            await member.mute(payload.duration);
        } else {
            await member.unmute();
        }
        return Ok();
    },
);
