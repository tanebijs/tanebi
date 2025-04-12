import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { OneBotGroup } from '@app/entity/group';
import { z } from 'zod';

export const get_group_info = defineAction(
    'get_group_info',
    z.object({
        group_id: zOneBotInputUin,
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id, payload.no_cache);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        return Ok<OneBotGroup>({
            group_id: group.uin,
            group_name: group.name,
            member_count: group.memberCount,
            max_member_count: group.maxMemberCount,
        });
    }
);