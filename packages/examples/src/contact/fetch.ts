import bot from '../login/fast';

const friends = await bot.getFriends();
for (const friend of friends) {
    console.log(`Friend ${friend.remark || friend.nickname} (Uin: ${friend.uin})`);
}

const groups = await bot.getGroups();
for (const group of groups) {
    console.log(`Group ${group.name} (Uin: ${group.uin})`);
    if (group.uin === 0) {
        // Substitute with your group's Uin
        const members = await group.getMembers();
        for (const member of members) {
            console.log(`  Member ${member.card || member.nickname}[${member.specialTitle}] (Uin: ${member.uin})`);
        }
    }
}