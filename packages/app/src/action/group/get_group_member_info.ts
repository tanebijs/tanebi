import { GroupMemberPermission } from '@/entity';
import { defineAction, Failed, Ok } from '@app/action';
import { get_stranger_info } from '@app/action/friend/get_stranger_info';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { OneBotGroupMember, OneBotGroupMemberRole, OneBotStranger } from '@app/entity/user';
import { z } from 'zod';

export const get_group_member_info = defineAction(
    'get_group_member_info',
    z.object({
        group_id: zOneBotInputUin,
        user_id: zOneBotInputUin,
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const group = await ctx.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(404, 'Group not found');
        }
        const member = await group.getMember(payload.user_id, payload.no_cache);
        if (!member) {
            return Failed(404, 'Member not found');
        }
        const extraInfo = (await get_stranger_info.handler(ctx, { user_id: member.uin, no_cache: payload.no_cache }))
            .data as OneBotStranger;
        const self = await group.getMember(ctx.bot.uin);
        return Ok<OneBotGroupMember>({
            group_id: group.uin,
            user_id: member.uin,
            qid: extraInfo.qid,
            nickname: member.nickname || '' + member.uin,
            card: member.card ?? '',
            sex: extraInfo.sex,
            age: extraInfo.age,
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
        });
    }
);