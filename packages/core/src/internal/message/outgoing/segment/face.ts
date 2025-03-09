import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { LargeFaceInfo } from '@/internal/packet/message/face/LargeFaceInfo';
import { SmallExtraFaceInfo } from '@/internal/packet/message/face/SmallExtraFaceInfo';
import { NapProtoEncodeStructType } from '@napneko/nap-proto-core';

export const faceBuilder = defineOutgoing(
    'face',
    (segment: {
        oldFaceId: number,
    } | {
        largeFaceInfo: NapProtoEncodeStructType<typeof LargeFaceInfo.fields>,
    } | {
        smallExtraFaceInfo: NapProtoEncodeStructType<typeof SmallExtraFaceInfo.fields>,
    }) => {
        if ('oldFaceId' in segment) {
            return { face: { index: segment.oldFaceId } };
        }
        if ('largeFaceInfo' in segment) {
            return {
                common: {
                    serviceType: 37,
                    pbElement: LargeFaceInfo.encode(segment.largeFaceInfo),
                    businessType: segment.largeFaceInfo.aniStickerType ?? 1,
                }
            };
        }
        if ('smallExtraFaceInfo' in segment) {
            return {
                common: {
                    serviceType: 33,
                    pbElement: SmallExtraFaceInfo.encode(segment.smallExtraFaceInfo),
                    businessType: 1,
                }
            };
        }
    }
);