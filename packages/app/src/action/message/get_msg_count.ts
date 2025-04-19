import { defineAction, Ok } from '@app/action';
import { z } from 'zod';

export const get_msg_count = defineAction(
    'get_msg_count',
    z.object({}),
    async (ctx) => {
        return Ok({ count: await ctx.storage.size() });
    },
);
