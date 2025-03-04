import { promisify } from 'util';
import stream from 'stream';
import zlib from 'zlib';

/**
 * promisified zlib.unzip
 */
export const unzip = promisify(zlib.unzip);

/**
 * promisified zlib.gzip
 */
export const gzip = promisify(zlib.gzip);

/**
 * promisified stream.pipeline
 */
export const pipeline = promisify(stream.pipeline);