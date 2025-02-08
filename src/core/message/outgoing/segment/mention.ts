import { defineOutgoing } from '@/core/message/outgoing/segment-base';
import { MentionExtra, MentionType } from '@/core/packet/message/element/TextElement';

export const mentionBuilder = defineOutgoing(
    'mention',
    (segment: { name: string, uin: number, uid: string }) => ({
        text: {
            str: segment.name,
            pbReserve: MentionExtra.encode({
                type: segment.uin === 0 ? MentionType.All : MentionType.Someone,
                uin: segment.uin,
                field5: 0,
                uid: segment.uid,
            }),
        }
    })
);