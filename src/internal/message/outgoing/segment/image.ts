import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { NapProtoEncodeStructType } from '@napneko/nap-proto-core';

export enum ImageBizType {
    Private = 10,
    Group = 20,
}

export const imageBuilder = defineOutgoing(
    'image',
    (segment: {
        msgInfo: NapProtoEncodeStructType<typeof MsgInfo.fields>,
        bizType: ImageBizType,
        compatImage?: NapProtoEncodeStructType<typeof NotOnlineImageElement>,
        compatFace?: NapProtoEncodeStructType<typeof CustomFaceElement>,
    }) => {
        return [
            {
                notOnlineImage: segment.compatImage,
                customFace: segment.compatFace,
            },
            {
                common: {
                    serviceType: 48,
                    pbElement: MsgInfo.encode(segment.msgInfo),
                    businessType: segment.bizType,
                }
            }
        ];
    }
);