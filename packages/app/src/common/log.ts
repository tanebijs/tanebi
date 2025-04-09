import { OneBotApp } from '@app/index';
import chalk from 'chalk';

export function installLogger(ctx: OneBotApp) {
    ctx.bot.onPrivateMessage((friend, message) =>
        ctx.logger.info(`${message.isSelf ? '->' : '<-'} [${chalk.yellow(friend)}] ${message.content.toPreviewString()}`, {
            module: 'Message',
        })
    );
    
    ctx.bot.onGroupMessage((group, sender, message) =>
        ctx.logger.info(
            `${
                sender.uin === ctx.bot.uin ? '->' : '<-'
            } [${chalk.blueBright(group)}] [${chalk.green(sender)}] ${message.content.toPreviewString()}`,
            { module: 'Message' }
        )
    );

    ctx.bot.onForceOffline((title, tip) => {
        ctx.logger.error(`[${title}] ${tip}`, { module: 'ForcedOffline' });
    });
    
    ctx.bot.onFriendPoke((friend, isSelf, actionStr, _, suffix) =>
        ctx.logger.info(
            isSelf
                ? `你${actionStr || '戳了戳'} ${friend} ${suffix}`
                : `${friend} ${actionStr || '戳了戳'}你${suffix}`,
            { module: 'FriendPoke' }
        )
    );
    
    ctx.bot.onFriendRecall((friend, seq, tip) =>
        ctx.logger.info(`${friend} 撤回了一条消息 [${seq}] ${tip}`, {
            module: 'FriendRecall',
        })
    );
    
    ctx.bot.onFriendRequest((req) => ctx.logger.info(req.toString(), { module: 'FriendRequest' }));
    
    ctx.bot.onGroupAdminChange((group, member, isPromote) =>
        ctx.logger.info(`[${group}] ${member} ${isPromote ? 'promoted to' : 'demoted from'} admin`, {
            module: 'GroupAdminChange',
        })
    );
    
    ctx.bot.onGroupEssenceMessageChange((group, sequence, operator, isAdd) => {
        ctx.logger.info(
            `[${group}] msg [${sequence}] ${isAdd ? 'added to' : 'removed from'} essence by ${operator}`,
            { module: 'GroupEssenceMessageChange' }
        );
    });
    
    ctx.bot.onGroupInvitationRequest((req) =>
        ctx.logger.info(req.toString(), { module: 'GroupInvitationRequest' })
    );
    
    ctx.bot.onGroupInvitedJoinRequest((_, req) =>
        ctx.logger.info(req.toString(), { module: 'GroupInvitedJoinRequest' })
    );
    
    ctx.bot.onGroupJoinRequest((_, req) => ctx.logger.info(req.toString(), { module: 'GroupJoinRequest' }));
    
    ctx.bot.onGroupMemberIncrease((group, member, operator) =>
        ctx.logger.info(
            `[${group}] ${member} joined` +
                        (operator ? ` by ${operator.card || operator.nickname} (${operator.uin})` : ''),
            { module: 'GroupMemberIncrease' }
        )
    );
    
    ctx.bot.onGroupMemberLeave((group, memberUin) =>
        ctx.logger.info(`[${group}] (${memberUin}) left`, { module: 'GroupMemberLeave' })
    );
    
    ctx.bot.onGroupMemberKick((group, memberUin, operator) =>
        ctx.logger.info(`[${group}] (${memberUin}) was kicked by ${operator}`, { module: 'GroupMemberKick' })
    );
    
    ctx.bot.onGroupMute((group, member, operator, duration) =>
        ctx.logger.info(`[${group}] ${member} was muted by ${operator} for ${duration} seconds`, {
            module: 'GroupMute',
        })
    );
    
    ctx.bot.onGroupUnmute((group, member, operator) =>
        ctx.logger.info(`[${group}] ${member} was unmuted by ${operator}`, { module: 'GroupUnmute' })
    );
    
    ctx.bot.onGroupMuteAll((group, operator, isSet) =>
        ctx.logger.info(`${group} ${isSet ? 'muted' : 'unmuted'} by ${operator}`, { module: 'GroupMuteAll' })
    );
    
    ctx.bot.onGroupReaction((group, seq, operator, code, isAdd) =>
        ctx.logger.info(`[${group}] ${operator} ${isAdd ? 'added' : 'removed'} reaction ${code} to msg [${seq}]`, {
            module: 'GroupReaction',
        })
    );
    
    ctx.bot.onGroupRecall((group, seq, tip, operator) =>
        ctx.logger.info(`[${group}] ${operator} 撤回了一条消息 [${seq}] ${tip}`, { module: 'GroupRecall' })
    );
    
    ctx.bot.onGroupPoke((group, sender, receiver, actionStr, _, suffix) =>
        ctx.logger.info(
            `[${group}] ${sender} ${actionStr || '戳了戳'} ${receiver} ${suffix}`,
            { module: 'GroupPoke' }
        )
    );
}