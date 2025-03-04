import { ctx } from 'tanebi';
import bot from '../login/fast';

bot[ctx].eventsDX.on('friendPoke', (fromUin, toUin, actionStr, suffix, actionImgUrl) => {
    console.log(`Friend ${fromUin} poked ${toUin} with ${actionStr} (${suffix}) (${actionImgUrl})`);
});

bot[ctx].eventsDX.on('friendRequest', (fromUin, fromUid, message, via) => {
    console.log(`Friend request from ${fromUid} (${fromUin}): ${message} via ${via}`);
});

bot[ctx].eventsDX.on('friendRecall', (fromUid, clientSequence, tip) => {
    console.log(`Friend ${fromUid} recalled message ${clientSequence} with ${tip}`);
});