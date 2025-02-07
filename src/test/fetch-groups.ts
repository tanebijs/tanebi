import bot from './fast';

const groups = await bot.ctx.ops.call('fetchGroups');
//console.log(JSON.stringify(groups, null, 4));

const groupMembers = await bot.ctx.ops.call('fetchGroupMembers', groups.groups[0].groupUin);
console.log(JSON.stringify(groupMembers, null, 4));