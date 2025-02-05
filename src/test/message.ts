import bot from './fast';

bot.ctx.events.on('messagePush', (msg) => {
    console.log('Received message:', JSON.stringify(
        msg.message?.body?.richText?.elements,
        (key, value) => {
            if (value?.type === 'Buffer') { // Skip Buffer content
                return `[BUFFER] ${Buffer.from(value.data).toString('hex')}`;
            } else {
                return value;
            }
        },
        4
    ));
});