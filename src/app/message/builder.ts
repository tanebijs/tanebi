import { BotGroupMember } from '@/app/entity';
import { OutgoingMessage } from '@/core/message/outgoing';

export function text(content: string): OutgoingMessage['segments'][number] {
    return { type: 'text', content };
}

export function mention(member: BotGroupMember): OutgoingMessage['segments'][number] {
    return {
        type: 'mention',
        uin: member.uin,
        uid: member.uid,
        name: '@' + (member.card || member.nickname),
    };
}