import { BotFriend, BotGroup } from '@/app/entity';
import bot from '../fast';

bot.globalMsg.on('message', (msg) => {
    if (msg.contact instanceof BotFriend) {
        console.log(`${msg.contact.nickname} (${msg.contact.uin})`);
        console.log('>>> ' + msg.content.toPreviewString());
    } else if (msg.contact instanceof BotGroup) {
        const group = msg.contact as BotGroup;
        msg.contact.getMember(msg.senderUin).then((member) => {
            console.log(`${group.name} (${group.uin}) ::: ${member?.card || member?.nickname} (${msg.senderUin})`);
            console.log('>>> ' + msg.content.toPreviewString());
        });
    }
});