import logger from './loggers/logger';
import botutil from './utilities/botutil';

await botutil.base('https://sign.lagrangecore.org/api/sign/30366')
    .configure(bot => {
        bot.onGroupMessage((group, sender, message) => {
            logger.info(`[${group.name}::${sender.nickname}] ${message.content.toPreviewString()}`);
        });

        bot.onGroupMessage((group, sender, message) => {
            if (message.type !== 'bubble') return;
            if (message.content.segments.length !== 1) return;
            if (message.content.segments[0].type !== 'text') return;
            if (message.content.segments[0].content !== 'hello') return;

            group.sendMsg((b) => {
                b.reply(message).text('Hello ').mention(sender).text('!\n\nPowered by Tanebi\n\n');
            });
        });
    })
    .login();
