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
    ) {}

    async handle(operation: GroupRequestOperation, message?: string) {
        await this.bot[ctx].ops.call(
            'handleGroupRequest',
            this.groupUin,
            this.sequence,
            GroupNotifyType.InvitedJoinRequest,
            operation,
            message ?? ''
        );
    }

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
        return new BotGroupInvitedJoinRequest(bot, groupUin, req.sequence, memberUin, targetUid, invitor);
    }
}