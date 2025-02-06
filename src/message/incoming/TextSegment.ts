import { defineIncoming } from '@/message/incoming/base';

export const TextSegment = defineIncoming(
    'text',
    'text',
    (element) => {
        if (!element.attr6Buf?.length) {
            return { content: element.str! };
        }
    },
);