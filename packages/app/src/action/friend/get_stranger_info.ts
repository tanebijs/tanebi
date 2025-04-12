import { FetchUserInfoKey, UserInfoGender } from '@/index';
import { defineAction, Ok } from '@app/action';
import { zOneBotInputBoolean, zOneBotInputUin } from '@app/common/types';
import { OneBotGender, OneBotStranger } from '@app/entity/user';
import { z } from 'zod';

export const get_stranger_info = defineAction(
    'get_stranger_info',
    z.object({
        user_id: zOneBotInputUin,
        no_cache: zOneBotInputBoolean.default(false),
    }),
    async (ctx, payload) => {
        const stranger = await ctx.bot.getUserInfo(payload.user_id, [
            FetchUserInfoKey.Qid,
            FetchUserInfoKey.Nickname,
            FetchUserInfoKey.Gender,
            FetchUserInfoKey.Age,
            FetchUserInfoKey.Level,
            FetchUserInfoKey.Signature,
        ]);
        return Ok<OneBotStranger>({
            user_id: stranger.uin,
            qid: stranger.qid,
            nickname: stranger.nickname ?? '' + stranger.uin,
            sex: stranger.gender === UserInfoGender.Male ? OneBotGender.Male
                : stranger.gender === UserInfoGender.Female ? OneBotGender.Female
                    : OneBotGender.Unknown,
            age: stranger.age ?? 0,
            level: stranger.level ?? 0,
            sign: stranger.signature ?? '',
        });
    },
    ['get_user_info']
);