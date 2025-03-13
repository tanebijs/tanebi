import { Bot, ctx, identityService, log } from '@/index';
import { BotGroupMember, GroupRequestOperation } from '@/entity';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';

export class BotGroupInvitedJoinRequest {
    private constructor(
        private readonly bot: Bot,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly invitor: BotGroupMember,
        readonly isFiltered: boolean,
    ) {}

    async handle(operation: GroupRequestOperation, message?: string) {
        await this.bot[ctx].ops.call(
            this.isFiltered ? 'handleGroupRequest' : 'handleGroupFilteredRequest',
            this.groupUin,
            this.sequence,
            GroupNotifyType.InvitedJoinRequest,
            operation,
            message ?? ''
        );
    }

    static async create(groupUin: number, targetUid: string, invitorUid: string, bot: Bot) {
        const latestReqs = await bot[ctx].ops.call('fetchGroupNotifies');
        let req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.InvitedJoinRequest
                    && req.group.groupUin === groupUin
                    && req.target.uid === targetUid
                    && req.invitor?.uid === invitorUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].ops.call('fetchGroupFilteredNotifies');
            req = latestFilteredReqs.find((req) =>
                req.notifyType === GroupNotifyType.InvitedJoinRequest
                        && req.group.groupUin === groupUin
                        && req.target.uid === targetUid
                        && req.invitor?.uid === invitorUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
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
        return new BotGroupInvitedJoinRequest(
            bot, groupUin, req.sequence, memberUin, targetUid, invitor, isFiltered);
    }
}