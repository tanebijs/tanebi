import { GroupMemberPermission } from '@/entity';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { OneBotGroupMember, OneBotGroupMemberRole } from '@app/entity/user';
import { z } from 'zod';

export const get_group_member_list = defineAction(
    'get_group_member_list',
    z.object({
        group_id: zOneBotInputUin,
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        const members = await group.getMembers(payload.no_cache);
        const self = await group.getMember(ctx.bot.uin!);
        return Ok<Partial<OneBotGroupMember>[]>(Array.from(members).map(member => ({
            group_id: group.uin,
            user_id: member.uin,
            nickname: member.nickname || '' + member.uin,
            card: member.card ?? '',
            join_time: member.joinTime,
            last_sent_time: member.lastMsgTime,
            level: '' + member.level,
            role: member.permission === GroupMemberPermission.Owner ? OneBotGroupMemberRole.Owner
                : member.permission === GroupMemberPermission.Admin ? OneBotGroupMemberRole.Admin
                    : OneBotGroupMemberRole.Member,
            unfriendly: false,
            title: member.specialTitle ?? '',
            title_expire_time: -1,
            card_changeable: self?.permission !== GroupMemberPermission.Member,
        })));
    }
);