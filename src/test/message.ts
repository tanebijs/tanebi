import bot from './fast';

bot.ctx.events.on('messagePush', (msg) => {
    if (msg) {
        delete msg.internalElems;
        console.log(msg);
    }
});