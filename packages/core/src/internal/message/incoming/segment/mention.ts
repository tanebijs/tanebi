import { defineIncoming } from '@/internal/message/incoming/segment-base';

export const mentionParser = defineIncoming(
    'text',
    'mention',
    (element) => {
        if (element.attr6Buf?.length && element.attr6Buf.length >= 11) {
            return {
                name: element.str!,
                uin: element.attr6Buf.readUInt32BE(7),
            };
        }
    },
);
