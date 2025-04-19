import { NTV2RichMediaRequestOf } from '@/internal/packet/oidb/media/request/NTV2RichMediaRequest';
import { NTV2RichMediaResponseOf } from '@/internal/packet/oidb/media/response/NTV2RichMediaResponse';
import { OidbSvcContract } from '@/internal/util/binary/oidb';

export const UploadGroupImage = new OidbSvcContract(0x11c4, 100, NTV2RichMediaRequestOf('upload'), false, true);
export const UploadGroupImageResponse = new OidbSvcContract(0x11c4, 100, NTV2RichMediaResponseOf('upload'));
export const DownloadGroupImage = new OidbSvcContract(0x11c4, 200, NTV2RichMediaRequestOf('download'), false, true);
export const DownloadGroupImageResponse = new OidbSvcContract(0x11c4, 200, NTV2RichMediaResponseOf('download'));
export const UploadPrivateImage = new OidbSvcContract(0x11c5, 100, NTV2RichMediaRequestOf('upload'), false, true);
export const UploadPrivateImageResponse = new OidbSvcContract(0x11c5, 100, NTV2RichMediaResponseOf('upload'));
export const DownloadPrivateImage = new OidbSvcContract(0x11c5, 200, NTV2RichMediaRequestOf('download'), false, true);
export const DownloadPrivateImageResponse = new OidbSvcContract(0x11c5, 200, NTV2RichMediaResponseOf('download'));

export const UploadGroupRecord = new OidbSvcContract(0x126e, 100, NTV2RichMediaRequestOf('upload'), false, true);
export const UploadGroupRecordResponse = new OidbSvcContract(0x126e, 100, NTV2RichMediaResponseOf('upload'));
export const DownloadGroupRecord = new OidbSvcContract(0x126e, 200, NTV2RichMediaRequestOf('download'), false, true);
export const DownloadGroupRecordResponse = new OidbSvcContract(0x126e, 200, NTV2RichMediaResponseOf('download'));
export const UploadPrivateRecord = new OidbSvcContract(0x126d, 100, NTV2RichMediaRequestOf('upload'), false, true);
export const UploadPrivateRecordResponse = new OidbSvcContract(0x126d, 100, NTV2RichMediaResponseOf('upload'));
export const DownloadPrivateRecord = new OidbSvcContract(0x126d, 200, NTV2RichMediaRequestOf('download'), false, true);
export const DownloadPrivateRecordResponse = new OidbSvcContract(0x126d, 200, NTV2RichMediaResponseOf('download'));

export const DownloadVideo = new OidbSvcContract(0x11e9, 200, NTV2RichMediaRequestOf('download'), false, true);
export const DownloadVideoResponse = new OidbSvcContract(0x11e9, 200, NTV2RichMediaResponseOf('download'));
