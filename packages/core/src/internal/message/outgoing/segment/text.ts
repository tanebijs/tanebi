import { defineOutgoing } from '@/internal/message/outgoing/segment-base';

export const textBuilder = defineOutgoing(
    'text',
    (segment: { content: string; }) => ({
        text: { str: segment.content },
    }),
);
