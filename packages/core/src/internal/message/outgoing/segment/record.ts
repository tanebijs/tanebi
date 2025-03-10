import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { NapProtoEncodeStructType } from '@napneko/nap-proto-core';

export const recordBuilder = defineOutgoing(
    'record',
    (segment: {
        msgInfo: NapProtoEncodeStructType<typeof MsgInfo.fields>,
    }) => {
        return {
            common: {
                serviceType: 48,
                pbElement: MsgInfo.encode(segment.msgInfo),
                businessType: 22,
            }
        };
    }
);