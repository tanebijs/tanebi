import bot from '../login/fast';

const friend = await bot.getFriend(0);
const message = await friend?.sendMsg(b => {
    b.text('Hello, this is a test message.');
});
setTimeout(() => {
    message?.recall();
}, 5000);