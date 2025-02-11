import { defineIncoming } from '@/core/message/incoming/segment-base';
import { CustomFaceElement } from '@/core/packet/message/element/CustomFaceElement';
import { IndexNode } from '@/core/packet/oidb/media/IndexNode';
import { MsgInfo } from '@/core/packet/oidb/media/MsgInfo';

export interface ImageSegment {
    indexNode?: ReturnType<typeof IndexNode.decode>,
    url?: string,
    subType: ImageSubType,
    summary: string,
}

const ntImageUrlBase = 'https://multimedia.nt.qq.com.cn';
const legacyImageUrlBase = 'http://gchat.qpic.cn';

export enum ImageSubType {
    Picture = 0,
    Face = 1,
}

export const imageCommonParser = defineIncoming(
    'common',
    'image',
    (element): ImageSegment | undefined => {
        if (
            element.serviceType === 48
            && (element.businessType === 20 || element.businessType === 10)
            && element.pbElement
        ) {
            const msgInfo = MsgInfo.decode(element.pbElement);
            if (msgInfo.msgInfoBody.length > 0) {
                const msgInfoBody = msgInfo.msgInfoBody[0];
                return {
                    indexNode: msgInfoBody.index,
                    subType: msgInfo.extBizInfo?.pic?.bizType ?? ImageSubType.Picture,
                    summary: msgInfo.extBizInfo?.pic?.textSummary || '[图片]'
                };
            }
        }
    },
);

export const imageNotOnlineParser = defineIncoming(
    'notOnlineImage',
    'image',
    (element): ImageSegment | undefined => {
        if (element.origUrl) {
            if (element.origUrl.includes('&fileid=')) { // is NT image
                return {
                    url: `${ntImageUrlBase}${element.origUrl}`,
                    subType: ImageSubType.Picture,
                    summary: element.pbRes?.summary || '[图片]',
                };
            } else { // is legacy image
                return {
                    url: `${legacyImageUrlBase}${element.origUrl}`,
                    subType: ImageSubType.Picture,
                    summary: element.pbRes?.summary || '[图片]',
                };
            }
        }
    }
);

export const imageCustomFaceParser = defineIncoming(
    'customFace',
    'image',
    (element): ImageSegment | undefined => {
        if (element.origUrl) {
            if (element.origUrl.includes('&fileid=')) { // is NT image
                return {
                    url: `${ntImageUrlBase}${element.origUrl}`,
                    subType: element.pbReserve?.subType ?? parseSubTypeFromOldData(element.oldData),
                    summary: element.pbReserve?.summary || '[动画表情]',
                };
            } else { // is legacy image
                return {
                    url: `${legacyImageUrlBase}${element.origUrl}`,
                    subType: element.pbReserve?.subType ?? parseSubTypeFromOldData(element.oldData),
                    summary: element.pbReserve?.summary || '[动画表情]',
                };
            }
        }
    }
);

function parseSubTypeFromOldData(element: ReturnType<typeof CustomFaceElement.decode>['oldData']) {
    if (!element || element.length < 5) {
        return ImageSubType.Picture; // May be legacy QQ
    }
    return element[4] === 0x36 ? ImageSubType.Face : ImageSubType.Picture;
}