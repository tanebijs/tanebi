import { PicFormat } from '@/internal/packet/oidb/media/FileInfo';
import { getGeneralMetadata, MediaGeneralMetadata } from '@/internal/util/media/common';
import imageSize, { type types } from 'image-size';

type imageType = (typeof types)[number];

export type SupportedPicFormat = 'png' | 'jpg' | 'gif' | 'webp' | 'bmp' | 'tiff';

export interface ImageMetadata extends MediaGeneralMetadata {
    width: number;
    height: number;
    ext: SupportedPicFormat;
    format: PicFormat;
}

export function getImageMetadata(img: Buffer): ImageMetadata {
    const size = imageSize(img);
    if (!size.width || !size.height || !size.type) {
        throw new Error('Failed to get image metadata');
    }
    const ext = size.type as imageType;
    return {
        width: size.width,
        height: size.height,
        ext: ext as SupportedPicFormat,
        format: picExtToFormat(ext),
        ...getGeneralMetadata(img),
    };
}

const picFormatToExtMap: Partial<Record<imageType, PicFormat>> = {
    png: PicFormat.PNG,
    jpg: PicFormat.JPEG,
    gif: PicFormat.GIF,
    webp: PicFormat.WEBP,
    bmp: PicFormat.BMP,
    tiff: PicFormat.TIFF,
};

export function picExtToFormat(ext: imageType): PicFormat {
    return picFormatToExtMap[ext] ?? PicFormat.UNKNOWN;
}
