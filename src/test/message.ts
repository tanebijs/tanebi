import bot from './fast';
import { b } from '@/app/message';

bot.ctx.events.on('messagePush', (msg) => {
    if (msg) {
        delete msg.internalElems;
        console.log(msg);
    }
});

const group = await bot.getGroup(0); // Substitute with your group's Uin
console.log(await group?.sendMsg([
    b.text('Hello, this is a test message.'),
]));