import { PicFormat } from '@/core/packet/oidb/media/FileInfo';
import { md5, sha1 } from '@/core/util/crypto/digest';
import imageSize from 'image-size';
import { imageType } from 'image-size/dist/types';

export type SupportedPicFormat = 'png' | 'jpg' | 'gif' | 'webp' | 'bmp' | 'tiff';

export interface ImageMetadata {
    size: number;
    width: number;
    height: number;
    ext: SupportedPicFormat;
    format: PicFormat;
    md5: Buffer;
    sha1: Buffer;
}

export function getImageMetadata(img: Uint8Array): ImageMetadata {
    const size = imageSize(img);
    if (!size.width || !size.height || !size.type) {
        throw new Error('Failed to get image metadata');
    }
    const ext = size.type as imageType;
    return {
        size: img.length,
        width: size.width,
        height: size.height,
        ext: ext as SupportedPicFormat,
        format: picExtToFormat(ext),
        md5: md5(img),
        sha1: sha1(img),
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
