import { BotGroupMember, OutgoingSegment } from '@/app/entity';

export function text(content: string): OutgoingSegment {
    return { type: 'text', content };
}

export function mention(member: BotGroupMember): OutgoingSegment {
    return {
        type: 'mention',
        uin: member.uin,
        uid: member.uid,
        name: '@' + (member.card || member.nickname),
    };
}

export function mentionAll(): OutgoingSegment {
    return { type: 'mention', uin: 0, uid: '', name: '@全体成员' };
}