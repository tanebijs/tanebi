import { ctx as internalCtx } from 'tanebi';
import { defineAction, Ok } from '@app/action';
import { AppName, AppVersion, OneBotProtocolVersion } from '@app/common/version';
import { z } from 'zod';

export const get_version_info = defineAction(
    'get_version_info',
    z.object({}),
    (ctx) => Ok({
        app_name: AppName,
        app_version: AppVersion,
        protocol_version: OneBotProtocolVersion,
        bot_app_id: ctx.bot[internalCtx].appInfo.SubAppId,
        bot_protocol_os: ctx.bot[internalCtx].appInfo.Os,
        bot_protocol_version: ctx.bot[internalCtx].appInfo.CurrentVersion,
    }),
);