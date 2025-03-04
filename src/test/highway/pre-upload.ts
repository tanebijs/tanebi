import bot from '@/test/login/fast';

import { ImageSubType } from '@/core/message/incoming/segment/image';
import { getImageMetadata } from '@/core/util/media/image';
import { readFileSync } from 'node:fs';
import { ctx } from '@/app';

const pngFile = readFileSync('temp/qrcode.png');
const uploadResp = await bot[ctx].ops.call(
    'uploadGroupImage',
    0, // substitute with your group id
    getImageMetadata(pngFile),
    ImageSubType.Picture,
);
console.log(uploadResp);