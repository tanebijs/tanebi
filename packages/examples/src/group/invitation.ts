import bot from '../login/fast';

bot.onGroupInvitationRequest((req) => {
    console.log(`Received group invitation request from ${req.invitor.nickname} to join group ${req.groupUin}`);
});
