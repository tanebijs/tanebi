import { ctx } from 'tanebi';
import bot from '../login/fast';

const fetchResult = await bot[ctx].ops.call('fetchHighwayUrl');
console.log(fetchResult);
