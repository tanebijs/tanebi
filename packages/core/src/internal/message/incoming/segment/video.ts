import { defineIncoming } from '@/internal/message/incoming/segment-base';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';

export const videoParser = defineIncoming(
    'common',
    'video',
    (element) => {
        if (
            element.serviceType === 48 &&
            (element.businessType === 21 || element.businessType === 11) &&
            element.pbElement
        ) {
            const msgInfo = MsgInfo.decode(element.pbElement);
            if (msgInfo.msgInfoBody.length > 0) {
                return {
                    indexNode: msgInfo.msgInfoBody[0].index!,
                };
            }
        }
    },
);
