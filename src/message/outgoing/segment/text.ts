import { defineOutgoing } from '@/message/outgoing/segment-base';

export const textBuilder = defineOutgoing(
    'text', 
    (segment: { content: string }) => ({
        text: { str: segment.content },
    })
);
