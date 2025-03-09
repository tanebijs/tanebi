import { ctx } from 'tanebi';
import bot from '../login/fast';
import { writeFileSync } from 'fs';

writeFileSync('temp/faces.json', JSON.stringify(
    await bot[ctx].ops.call('fetchFaceDetails'),
    null,
    4
));