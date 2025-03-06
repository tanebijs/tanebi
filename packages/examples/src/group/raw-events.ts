import { ctx } from 'tanebi';
import bot from '../login/fast';

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

bot[ctx].eventsDX.on('groupMute', (groupUin, targetUid, operatorUid, duration) => {
    console.log(`Group ${groupUin} mute: ${targetUid} by ${operatorUid} for ${duration} seconds`);
});

bot[ctx].eventsDX.on('groupMuteAll', (groupUin, operatorUid, isSet) => {
    console.log(`Group ${groupUin} mute all: ${isSet ? 'set' : 'unset'} by ${operatorUid}`);
});

bot[ctx].eventsDX.on('groupPoke', (groupUin, fromUin, toUin, actionStr, actionImgUrl, suffix) => {
    console.log(`Group ${groupUin} poke: ${fromUin} to ${toUin} with ${actionStr} (${suffix}) (${actionImgUrl})`);
});

bot[ctx].eventsDX.on('groupEssenceMessageChange', (groupUin, sequence, operatorUin, isAdd) => {
    console.log(`Group ${groupUin} essence message ${isAdd ? 'add' : 'remove'}: ${sequence} by ${operatorUin}`);
});

bot[ctx].eventsDX.on('groupRecall', (groupUin, sequence, tip, operatorUid) => {
    console.log(`Group ${groupUin} recall: ${sequence} with ${tip} by ${operatorUid}`);
});

bot[ctx].eventsDX.on('groupReaction', (groupUin, sequence, operatorUid, reactionCode, isAdd, count) => {
    console.log(`Group ${groupUin} reaction ${isAdd ? 'add' : 'remove'}: ${sequence} by ${operatorUid} with ${reactionCode} (${count})`);
});