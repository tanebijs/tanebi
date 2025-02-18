import bot from '../fast';

const fetchResult = await bot.ctx.ops.call('fetchHighwayUrl');
console.log(fetchResult);