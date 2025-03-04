import { ctx } from '@/app';
import bot from '@/test/login/fast';

const fetchResult = await bot[ctx].ops.call('fetchHighwayUrl');
console.log(fetchResult);