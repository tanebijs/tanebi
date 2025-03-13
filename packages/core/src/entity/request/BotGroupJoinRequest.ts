import { Bot, ctx, identityService, log } from '@/index';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';

export class BotGroupJoinRequest {
    private constructor(
        private readonly bot: Bot,
        readonly sequence: bigint,
        readonly requestUin: number,
        readonly requestUid: string,
        readonly comment: string,
        readonly isFiltered: boolean,
    ) {}

    static async create(groupUin: number, requestUid: string, bot: Bot) {
        const latestReqs = await bot[ctx].ops.call('fetchGroupNotifies');
        let req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.JoinRequest
            && req.group.groupUin === groupUin
            && req.target.uid === requestUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].ops.call('fetchGroupFilteredNotifies');
            req = latestFilteredReqs.find((fReq) =>
                fReq.notifyType === GroupNotifyType.JoinRequest
                && fReq.group.groupUin === groupUin
                && fReq.target.uid === requestUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
        }
        const uinFetch = await bot[ctx].ops.call('fetchUserInfo', req.target.uid);
        bot[identityService].uid2uin.set(req.target.uid, uinFetch.body.uin);
        bot[identityService].uin2uid.set(uinFetch.body.uin, req.target.uid);
        bot[log].emit('info', 'BotGroupJoinRequest',
            `Received join request: ${uinFetch.body.uin} -> ${groupUin}; comment: ${req.comment}`);
        return new BotGroupJoinRequest(
            bot, req.sequence, uinFetch.body.uin, requestUid, req.comment, isFiltered);
    }
}