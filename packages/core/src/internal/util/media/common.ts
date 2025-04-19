import { md5, sha1 } from '@/internal/util/crypto/digest';

export interface MediaGeneralMetadata {
    size: number;
    md5: Buffer;
    sha1: Buffer;
}

export function getGeneralMetadata(data: Buffer): MediaGeneralMetadata {
    return {
        size: data.length,
        md5: md5(data),
        sha1: sha1(data),
    };
}
