import { NTV2RichMediaRequestOf } from '@/core/packet/oidb/media/request/NTV2RichMediaRequest';
import { NTV2RichMediaResponseOf } from '@/core/packet/oidb/media/response/NTV2RichMediaResponse';
import { OidbSvcContract } from '@/core/util/binary/oidb';

export const DownloadPrivateImage = new OidbSvcContract(
    0x11c5, 200,
    NTV2RichMediaRequestOf('download'),
    false, true,
);

export const DownloadPrivateImageResponse = new OidbSvcContract(
    0x11c5, 200,
    NTV2RichMediaResponseOf('download'),
);