import { BotFriend } from '@/entity/BotFriend';
import { IncomingSegmentOf } from '@/internal/message/incoming';
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
        readonly sequence: bigint,
        readonly invitor: BotFriend,
        readonly groupUin: number,
    ) {}

    static async create(invitor: BotFriend, lightApp: IncomingSegmentOf<'lightApp'>) {
        const parsed = lightAppGroupInvitationPattern.safeParse(lightApp.payload);
        if (!parsed.success) {
            throw new Error('Failed to parse light app content');
        }
        const url = new URL(parsed.data.meta.news.jumpUrl);
        const groupUin = parseInt(url.searchParams.get('groupcode')!);
        const sequence = BigInt(url.searchParams.get('msgseq')!);
        return new BotGroupInvitationRequest(sequence, invitor, groupUin);
    }
}