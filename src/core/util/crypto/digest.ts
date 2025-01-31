import { BinaryLike, createHash } from 'crypto';

export const md5 = (data: BinaryLike) => createHash('md5').update(data).digest();

/**
 * A shortcut for creating a SHA1 hash
 * @param data Data to hash
 */
export function sha1(data: BinaryLike) {
    return createHash('sha1').update(data).digest();
}

/**
 * A shortcut for creating a SHA256 hash
 * @param data Data to hash
 */
export function sha256(data: BinaryLike) {
    return createHash('sha256').update(data).digest();
}