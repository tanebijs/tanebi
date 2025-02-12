import { DeleteResp } from '@/core/packet/oidb/media/response/DeleteResp';
import { DownloadResp } from '@/core/packet/oidb/media/response/DownloadResp';
import { DownloadRKeyResp } from '@/core/packet/oidb/media/response/DownloadRKeyResp';
import { DownloadSafeResp } from '@/core/packet/oidb/media/response/DownloadSafeResp';
import { MsgInfoAuthResp } from '@/core/packet/oidb/media/response/MsgInfoAuthResp';
import { MultiMediaRespHead } from '@/core/packet/oidb/media/response/MultiMediaRespHead';
import { UploadCompletedResp } from '@/core/packet/oidb/media/response/UploadCompletedResp';
import { UploadKeyRenewalResp } from '@/core/packet/oidb/media/response/UploadKeyRenewalResp';
import { UploadResp } from '@/core/packet/oidb/media/response/UploadResp';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const NTV2RichMediaResponse = new NapProtoMsg({
    respHead: ProtoField(1, () => MultiMediaRespHead.fields, true, false),
    upload: ProtoField(2, () => UploadResp.fields, true, false),
    download: ProtoField(3, () => DownloadResp.fields, true, false),
    downloadRKey: ProtoField(4, () => DownloadRKeyResp.fields, true, false),
    delete: ProtoField(5, () => DeleteResp.fields, true, false),
    uploadCompleted: ProtoField(6, () => UploadCompletedResp.fields, true, false),
    msgInfoAuth: ProtoField(7, () => MsgInfoAuthResp.fields, true, false),
    uploadKeyRenewal: ProtoField(8, () => UploadKeyRenewalResp.fields, true, false),
    downloadSafe: ProtoField(9, () => DownloadSafeResp.fields, true, false),
    extension: ProtoField(99, ScalarType.BYTES, true, false),
});

export function NTV2RichMediaResponseOf<T extends 
    Exclude<keyof typeof NTV2RichMediaResponse.fields, 'respHead' | 'extension'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(_type: T) {
    return NTV2RichMediaResponse.fields as ({
        [K in T | 'respHead' | 'extension']: typeof NTV2RichMediaResponse.fields[K];
    });
}