import { ImageSubType } from '@/core/message/incoming/segment/image';
import { defineOperation } from '@/core/operation/OperationBase';
import { UploadGroupImage, UploadGroupImageResponse } from '@/core/packet/oidb/0x11c4_100';
import { BUF0 } from '@/core/util/constants';
import { ImageMetadata } from '@/core/util/media/image';
import crypto from 'crypto';

const bytesPbReserveTroop = Buffer.from('0800180020004200500062009201009a0100a2010c080012001800200028003a00', 'hex');

export const UploadGroupImageOperation = defineOperation(
    'uploadGroupImage',
    'OidbSvcTrpcTcp.0x11c4_100',
    (ctx, groupUin: number, img: ImageMetadata, subType: ImageSubType, summary?: string) => {
        const md5Str = img.md5.toString('hex');
        const generatedFileName = `${md5Str}.${img.ext}`;
        return Buffer.from(UploadGroupImage.encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 2,
                    groupExt: { groupUin },
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: img.size,
                            fileHash: md5Str,
                            fileSha1: img.sha1.toString('hex'),
                            fileName: generatedFileName,
                            type: {
                                type: 1,
                                picFormat: img.format,  //TODO: extend NapCat imgType /cc @MliKiowa
                                videoFormat: 0,
                                voiceFormat: 0,
                            },
                            width: img.width,
                            height: img.height,
                            time: 0,
                            original: 1
                        },
                        subFileType: 0,
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 1,
                extBizInfo: {
                    pic: {
                        bizType: subType,
                        bytesPbReserveTroop,
                        textSummary: summary ?? (subType === ImageSubType.Picture ? '[图片]' : '[动画表情]'),
                    },
                    video: {
                        bytesPbReserve: BUF0,
                    },
                    ptt: {
                        bytesPbReserve: BUF0,
                        bytesReserve: BUF0,
                        bytesGeneralFlags: BUF0,
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false,
            }
        }));
    },
    (ctx, payload) => UploadGroupImageResponse.decodeBodyOrThrow(payload),
);