import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { NapProtoEncodeStructType } from '@napneko/nap-proto-core';

export enum RecordBizType {
    Private = 12,
    Group = 22,
}

export const recordBuilder = defineOutgoing(
    'record',
    (segment: {
        msgInfo: NapProtoEncodeStructType<typeof MsgInfo.fields>,
        bizType: RecordBizType,
    }) => {
        return {
            common: {
                serviceType: 48,
                pbElement: MsgInfo.encode(segment.msgInfo),
                businessType: segment.bizType,
            }
        };
    }
);