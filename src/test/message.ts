import { MessageType } from '@/core/message';
import bot from './fast';

bot.ctx.events.on('messagePush', (msg) => {
    if (msg) {
        delete msg.internalElems;
        console.log(msg);
    }
});

setTimeout(() => {
    bot.ctx.ops.call('sendMessage', {
        type: MessageType.GroupMessage,
        groupUin: 0, // substitute with your group uin
        clientSequence: 100000,
        segments: [
            { type: 'text', content: 'Hello, world!' },
        ]
    }).then(resp => console.log(resp));
}, 3000);