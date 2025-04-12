import { defineAction, Ok } from '@app/action';
import { zOneBotInputBoolean } from '@app/common/types';
import { OneBotFriend } from '@app/entity/user';
import { z } from 'zod';

export const get_friend_list = defineAction(
    'get_friend_list',
    z.object({
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const friends = await ctx.bot.getFriends(payload.no_cache);
        return Ok<OneBotFriend[]>(Array.from(friends).map(friend => ({
            user_id: friend.uin,
            qid: friend.qid,
            nickname: friend.nickname ?? '' + friend.uin,
            remark: friend.remark ?? '',
        })));
    },
);