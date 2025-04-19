import { GroupRequestOperation } from 'tanebi';
import bot from '../login/fast';

bot.onGroupJoinRequest((grp, req) => {
    console.log(req);
    if (req.comment.includes('accept')) {
        req.handle(GroupRequestOperation.Accept);
    }
    if (req.comment.includes('reject')) {
        req.handle(GroupRequestOperation.Reject);
    }
});

bot.onGroupInvitationRequest((req) => {
    console.log(req);
    if (req.invitor.uin === 0) { // Substitute with some uin
        req.handle(true);
    } else {
        req.handle(false);
    }
});

bot.onGroupInvitedJoinRequest((grp, req) => {
    console.log(req);
    if (req.invitor.uin === 0) { // Substitute with some uin
        req.handle(GroupRequestOperation.Accept);
    } else {
        req.handle(GroupRequestOperation.Reject);
    }
});
