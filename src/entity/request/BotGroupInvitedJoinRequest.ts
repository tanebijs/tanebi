import { Bot, ctx, identityService, log } from '@/index';
import { BotGroupMember } from '@/entity/BotGroupMember';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0_1';

export class BotGroupInvitedJoinRequest {
    private constructor(
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly invitor: BotGroupMember,
    ) {}

    static async create(groupUin: number, targetUid: string, invitorUid: string, bot: Bot) {
        const latestReqs = await bot[ctx].ops.call('fetchGroupNotifies');
        const req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.InvitedJoinRequest
                    && req.group.groupUin === groupUin
                    && req.target.uid === targetUid
                    && req.invitor?.uid === invitorUid);
        if (!req) {
            return null;
        }
        const memberUin = await bot[identityService].resolveUin(invitorUid, groupUin);
        if (!memberUin) {
            return null;
        }
        const invitor = await (await bot.getGroup(groupUin))?.getMember(memberUin);
        if (!invitor) {
            return null;
        }
        bot[log].emit('info', 'BotGroupInvitedJoinRequest',
            `Received invited join request: ${memberUin} -> ${groupUin}; invitor: ${invitorUid}`);
        return new BotGroupInvitedJoinRequest(req.sequence, memberUin, targetUid, invitor);
    }
}