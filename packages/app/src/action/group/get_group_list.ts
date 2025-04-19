import { defineAction, Ok } from '@app/action';
import { zOneBotInputBoolean } from '@app/common/types';
import { OneBotGroup } from '@app/entity/group';
import { z } from 'zod';

export const get_group_list = defineAction(
    'get_group_list',
    z.object({
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const groups = await ctx.bot.getGroups(payload.no_cache);
        return Ok<OneBotGroup[]>(
            Array.from(groups).map(group => ({
                group_id: group.uin,
                group_name: group.name,
                member_count: group.memberCount,
                max_member_count: group.maxMemberCount,
            })),
        );
    },
);
