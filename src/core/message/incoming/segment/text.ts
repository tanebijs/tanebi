import { defineIncoming } from '@/core/message/incoming/segment-base';

export const textParser = defineIncoming(
    'text',
    'text',
    (element) => {
        if (!element.attr6Buf?.length) {
            return { content: element.str! };
        }
    },
);