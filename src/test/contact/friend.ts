import bot from '@/test/login/fast';
import { readFileSync } from 'node:fs';

const friends = await bot.getFriends();

for (const friend of friends) {
    console.log(`Friend ${friend.remark || friend.nickname} (Uin: ${friend.uin})`);

    if (friend.uin === 0) {
        // Substitute with your friend's Uin
        // well he/she must be a good friend or he/she will be mad at you
        const sendMsgResult = await friend.sendMsg(async (b) => {
            b.text('Hello, this is a test message.');
            await b.image(readFileSync('temp/qrcode.png'));
        });
        console.log(`Message sent, sequence: ${sendMsgResult.sequence}, timestamp: ${sendMsgResult.timestamp}`);
    }
}