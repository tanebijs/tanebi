import { ctx as internalCtx } from 'tanebi';
import { defineAction, Ok } from '@app/action';
import { zOneBotInputBoolean } from '@app/common/types';
import { z } from 'zod';

export const set_friend_add_request = defineAction(
    'set_friend_add_request',
    z.object({
        flag: z.string(),
        approve: zOneBotInputBoolean,
    }),
    async (ctx, payload) => {
        await ctx.bot[internalCtx].ops.call('handleFriendRequest', payload.approve, payload.flag);
        return Ok();
    }
);