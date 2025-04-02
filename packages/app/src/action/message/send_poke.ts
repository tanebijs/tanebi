import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputUin } from '@app/common/types';
import { z } from 'zod';

export const send_poke = defineAction(
    'send_poke',
    z.object({
        user_id: zOneBotInputUin,
        group_id: zOneBotInputUin.optional(),
    }),
    async (ctx, payload) => {
        if (payload.group_id) {
            const group = await ctx.bot.getGroup(payload.group_id);
            if (!group) {
                return Failed(404, `Group ${payload.group_id} not found`);
            }
            const member = await group.getMember(payload.user_id);
            if (!member) {
                return Failed(404, `Member ${payload.user_id} not found in group ${payload.group_id}`);
            }
            await member.sendGrayTipPoke();
            return Ok();
        } else {
            const friend = await ctx.bot.getFriend(payload.user_id);
            if (!friend) {
                return Failed(404, `Friend ${payload.user_id} not found`);
            }
            await friend.sendGrayTipPoke();
            return Ok();
        }
    },
    ['friend_poke', 'group_poke'],
);