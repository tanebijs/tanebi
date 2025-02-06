import { defineIncoming } from '@/message/incoming/base';

export const MentionSegment = defineIncoming(
    'text',
    'mention',
    (element) => {
        if (element.attr6Buf?.length && element.attr6Buf.length >= 11) {
            return {
                name: element.str!,
                uin: Buffer.from(element.attr6Buf).readUInt32BE(7),
            };
        }
    }
);