import bot from './fast';

console.log(JSON.stringify(await bot.ctx.ops.call('fetchFriends'), null, 4));