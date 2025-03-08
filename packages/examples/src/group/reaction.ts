import { ReactionType } from 'tanebi';
import bot from '../login/fast';

const group = await bot.getGroup(0);
group?.onReaction(async (sequence, member, reactionCode, isAdd) => {
    if (member.uin === bot.uin) return;
    group?.sendReaction(
        sequence - 1,
        reactionCode,
        parseInt(reactionCode) >= 100000 ?
            ReactionType.Emoji : ReactionType.Face,
        isAdd
    );
});