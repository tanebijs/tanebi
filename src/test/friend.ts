import bot from './fast';

const friends = await bot.getFriends();

for (const friend of friends) {
    console.log(`Friend ${friend.remark || friend.nickname} (Uin: ${friend.uin})`);

    if (friend.uin === 0) {
        // Substitute with your friend's Uin
        // well he/she must be a good friend or he/she will be mad at you
        const sendMsgResult = await friend.sendMsg([
            { type: 'text', content: 'Hello, this is a test message.' },
        ]);
        console.log(`Message sent, sequence: ${sendMsgResult.sequence}, timestamp: ${sendMsgResult.timestamp}`);
    }
}