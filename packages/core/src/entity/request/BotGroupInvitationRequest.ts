import { BotFriend, GroupRequestOperation } from '@/entity';
import { Bot, ctx } from '@/index';
import { IncomingSegmentOf } from '@/internal/message/incoming';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { URL } from 'node:url';
import { z } from 'zod';

const lightAppGroupInvitationPattern = z.object({
    meta: z.object({
        news: z.object({
            jumpUrl: z.string(),
        })
    })
});

export class BotGroupInvitationRequest {
    private constructor(
        private readonly bot: Bot,
        readonly sequence: bigint,
        readonly invitor: BotFriend,
        readonly groupUin: number,
    ) {}

    async handle(isAccept: boolean, message?: string) {
        await this.bot[ctx].ops.call(
            'handleGroupRequest',
            this.groupUin,
            this.sequence,
            GroupNotifyType.Invitation,
            isAccept ? GroupRequestOperation.Accept : GroupRequestOperation.Reject,
            message ?? ''
        );
    }

    static async create(invitor: BotFriend, lightApp: IncomingSegmentOf<'lightApp'>, bot: Bot) {
        const parsed = lightAppGroupInvitationPattern.safeParse(lightApp.payload);
        if (!parsed.success) {
            throw new Error('Failed to parse light app content');
        }
        const url = new URL(parsed.data.meta.news.jumpUrl);
        const groupUin = parseInt(url.searchParams.get('groupcode')!);
        const sequence = BigInt(url.searchParams.get('msgseq')!);
        return new BotGroupInvitationRequest(bot, sequence, invitor, groupUin);
    }
}