import bot from '@/test/login/fast';

const friend = await bot.getFriend(0); // Substitute with your friend's Uin

friend?.onMessage(msg => {
    friend.sendMsg(b => {
        b.reply(msg);
        b.text('Ciallo');
    });
});