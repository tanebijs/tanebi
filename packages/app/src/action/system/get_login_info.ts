import { defineAction, Ok } from '@app/action';
import { z } from 'zod';

export const get_login_info = defineAction(
    'get_login_info',
    z.object({}),
    (ctx) => {
        return Ok({
            user_id: ctx.bot.uin,
            nickname: ctx.bot.name,
        });
    },
);
