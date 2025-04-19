import { ReactionType } from 'tanebi';
import logger from './loggers/logger';
import botutil from './utilities/botutil';

// const image = await fs.readFile("1.jpeg");

await botutil.base('https://sign.lagrangecore.org/api/sign/30366')
    .configure(bot => {
        bot.onGroupMessage((group, sender, message) => {
            logger.info(`[${group.name}::${sender.nickname}] ${message.content.toPreviewString()}`);
        });

        bot.onGroupMessage(async (group, sender, message) => {
            if (message.type !== 'bubble') return;
            if (message.content.segments.length === 1) return;
            if (message.content.segments[0].type !== 'text') return;
            if (message.content.segments[0].content.trim() !== 'hello') return;

            await group.sendReaction(message.sequence, '424', ReactionType.Face, true);

            const ab = await fetch('https://pic.0013107.xyz/pic?type=./白圣女黑白').then(r => r.arrayBuffer());
            await group.sendMsg((b) => {
                b.reply(message)
                    .text('Hello ')
                    .mention(sender)
                    .text('!\n')
                    .image(Buffer.from(ab))
                    .text('\n\nPowered by Tanebi');
            });

            await group.sendReaction(message.sequence, '424', ReactionType.Face, false);
            await group.sendReaction(message.sequence, '124', ReactionType.Face, true);
        });
    })
    .login();
