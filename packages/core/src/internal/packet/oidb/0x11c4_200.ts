import { NTV2RichMediaRequestOf } from '@/internal/packet/oidb/media/request/NTV2RichMediaRequest';
import { NTV2RichMediaResponseOf } from '@/internal/packet/oidb/media/response/NTV2RichMediaResponse';
import { OidbSvcContract } from '@/internal/util/binary/oidb';

export const DownloadGroupImage = new OidbSvcContract(
    0x11c4, 200,
    NTV2RichMediaRequestOf('download'),
    false, true,
);

export const DownloadGroupImageResponse = new OidbSvcContract(
    0x11c4, 200,
    NTV2RichMediaResponseOf('download'),
);