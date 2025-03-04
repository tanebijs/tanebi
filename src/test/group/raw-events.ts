import { ctx } from '@/app';
import bot from '@/test/login/fast';

bot[ctx].eventsDX.on('groupAdminChange', (groupUin, targetUid, isPromote) => {
    console.log(`Group ${groupUin} admin ${isPromote ? 'set' : 'unset'}: ${targetUid}`);
});

bot[ctx].eventsDX.on('groupJoinRequest', (groupUin, memberUid) => {
    console.log(`Group ${groupUin} join request: ${memberUid}`);
});

bot[ctx].eventsDX.on('groupInvitationRequest', (groupUin, invitorUid) => {
    console.log(`Group ${groupUin} invitation request: ${invitorUid}`);
});

bot[ctx].eventsDX.on('groupInvitedJoinRequest', (groupUin, targetUid, invitorUid) => {
    console.log(`Group ${groupUin} invited join request: ${targetUid} by ${invitorUid}`);
});

bot[ctx].eventsDX.on('groupMemberIncrease', (groupUin, memberUid, operatorUid) => {
    console.log(`Group ${groupUin} member increase: ${memberUid} by ${operatorUid}`);
});

bot[ctx].eventsDX.on('groupMemberDecrease', (groupUin, memberUid, operatorUid) => {
    console.log(`Group ${groupUin} member decrease: ${memberUid} by ${operatorUid}`);
});