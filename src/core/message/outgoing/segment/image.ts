import { defineOutgoing } from '@/core/message/outgoing/segment-base';
import { CustomFaceElement } from '@/core/packet/message/element/CustomFaceElement';
import { NotOnlineImageElement } from '@/core/packet/message/element/NotOnlineImageElement';
import { MsgInfo } from '@/core/packet/oidb/media/MsgInfo';
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