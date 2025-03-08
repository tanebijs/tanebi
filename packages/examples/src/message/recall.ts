import bot from '../login/fast';

const friend = await bot.getFriend(0);
const message = await friend?.sendMsg(b => {
    b.text('Hello, this is a test message.');
});
setTimeout(() => {
    message?.recall();
}, 5000);

const group = await bot.getGroup(0);
const groupMessage = await group?.sendMsg(b => {
    b.text('Hello, this is a test message.');
});
setTimeout(() => {
    group?.recallMsg(groupMessage!.sequence);
}, 5000);