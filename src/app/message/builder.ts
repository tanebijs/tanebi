import { BotGroupMember, OutgoingSegmentOf } from '@/app/entity';

export function text(content: string): OutgoingSegmentOf<'text'> {
    return { type: 'text', content };
}

export function mention(member: BotGroupMember): OutgoingSegmentOf<'mention'> {
    return {
        type: 'mention',
        uin: member.uin,
        uid: member.uid,
        name: '@' + (member.card || member.nickname),
    };
}

export function mentionAll(): OutgoingSegmentOf<'mention'> {
    return { type: 'mention', uin: 0, uid: '', name: '@全体成员' };
}