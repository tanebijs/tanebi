import { defineIncoming } from '@/internal/message/incoming/segment-base';
import { LargeFaceInfo } from '@/internal/packet/message/face/LargeFaceInfo';
import { SmallExtraFaceInfo } from '@/internal/packet/message/face/SmallExtraFaceInfo';

export interface FaceSegment {
    faceId: number;
    summary?: string;
    isInLargeCategory: boolean;
}

export const faceOldFaceParser = defineIncoming(
    'face',
    'face',
    (element): FaceSegment | undefined => {
        if (element.old) return {
            faceId: element.index ?? 0,
            isInLargeCategory: false,
        };
    }
);

export const faceCommonParser = defineIncoming(
    'common',
    'face',
    (element): FaceSegment | undefined => {
        if (element.pbElement) {
            if (element.serviceType === 37) {
                const largeFaceInfo = LargeFaceInfo.decode(element.pbElement);
                return {
                    faceId: largeFaceInfo.faceId,
                    summary: largeFaceInfo.preview,
                    isInLargeCategory: true,
                };
            } else if (element.serviceType === 33) {
                const smallExtraFaceInfo = SmallExtraFaceInfo.decode(element.pbElement);
                return {
                    faceId: smallExtraFaceInfo.faceId,
                    summary: smallExtraFaceInfo.text1 ?? smallExtraFaceInfo.text2,
                    isInLargeCategory: false,
                };
            }
        }
    }
);