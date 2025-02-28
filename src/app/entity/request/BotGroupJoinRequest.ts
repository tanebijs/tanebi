import { Bot } from '@/app';
import { GroupNotifyType } from '@/core/packet/oidb/0x10c0_1';

export class BotGroupJoinRequest {
    private constructor(
        readonly sequence: bigint,
        readonly requestUin: number,
        readonly requestUid: string,
        readonly comment: string,
    ) {}

    static async create(groupUin: number, requestUid: string, bot: Bot) {
        const latestReqs = await bot.ctx.ops.call('fetchGroupNotifies');
        const req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.JoinRequest
            && req.group.groupUin === groupUin
            && req.target.uid === requestUid);
        if (!req) {
            return null;
        }
        const uinFetch = await bot.ctx.ops.call('fetchUserInfo', req.target.uid);
        bot.identityService.uid2uin.set(req.target.uid, uinFetch.body.uin);
        bot.identityService.uin2uid.set(uinFetch.body.uin, req.target.uid);
        bot.log.emit('info', 'BotGroupJoinRequest',
            `Received join request: ${uinFetch.body.uin} -> ${groupUin}; comment: ${req.comment}`);
        return new BotGroupJoinRequest(req.sequence, uinFetch.body.uin, requestUid, req.comment);
    }
}