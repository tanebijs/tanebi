import bot from './fast';

console.log(JSON.stringify(await bot.ctx.ops.call('fetchGroups'), null, 4));