import bot from './fast';
import { b } from '@/app/message';

const group = await bot.getGroup(0); // Substitute with your group's Uin

console.log(await group?.sendMsg([
    b.text('Hello, this is a test message.'),
]));

group?.onMessage(({ sender, type, content }) => {
    console.log(`${sender.card || sender.nickname} (${sender.uin}): [${type}] ${content.toPreviewString()}`);
});