import bot from '../login/fast';

bot.onPrivateMessage((friend, msg) => {
    console.log(`${friend.nickname} (${friend.uin}) [seq=${msg.sequence}; replied=${msg.repliedSequence}]`);
    console.log('>>> ' + msg.content.toPreviewString());
});

bot.onGroupMessage((group, sender, msg) => {
    console.log(`${group.name} (${group.uin}) ::: ${sender.card || sender.nickname} (${sender.uin}) [seq=${msg.sequence}; replied=${msg.repliedSequence}]`);
    console.log('>>> ' + msg.content.toPreviewString());
});