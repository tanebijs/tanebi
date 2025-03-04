import { BotFriend, BotGroup } from '@/entity';
import bot from '@/test/login/fast';

bot.globalMsg.on('message', (msg) => {
    if (msg.contact instanceof BotFriend) {
        console.log(`${msg.contact.nickname} (${msg.contact.uin}) [seq=${msg.sequence}; replied=${msg.repliedSequence}]`);
        console.log('>>> ' + msg.content.toPreviewString());
    } else if (msg.contact instanceof BotGroup) {
        const group = msg.contact as BotGroup;
        msg.contact.getMember(msg.senderUin).then((member) => {
            console.log(`${group.name} (${group.uin}) ::: ${member?.card || member?.nickname} (${msg.senderUin}) [seq=${msg.sequence}; replied=${msg.repliedSequence}]`);
            console.log('>>> ' + msg.content.toPreviewString());
        });
    }
});