import bot from '../login/fast';

const friend = await bot.getFriend(0); // Substitute with your friend's Uin
friend?.onMessage(() => friend.sendGrayTipPoke());

const group = await bot.getGroup(0); // Substitute with your group's Uin
group?.onMessage((msg) => {
    msg.sender.sendGrayTipPoke();
});