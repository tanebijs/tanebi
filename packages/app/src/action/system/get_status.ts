import { defineAction, Ok } from '@app/action';
import { z } from 'zod';

export const get_status = defineAction(
    'get_status',
    z.object({}),
    (ctx) => {
        return Ok({
            online: ctx.bot.loggedIn,
            good: true,
        });
    }
);