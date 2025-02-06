import { defineIncoming } from '@/message/incoming/segment-base';

export const TextSegment = defineIncoming(
    'text',
    'text',
    (element) => {
        if (!element.attr6Buf?.length) {
            return { content: element.str! };
        }
    },
);