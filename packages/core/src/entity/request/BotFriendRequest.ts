import { Bot, ctx } from '@/index';

export class BotFriendRequest {
    constructor(
        private readonly bot: Bot,
        readonly fromUin: number,
        readonly fromUid: string,
        readonly message: string,

        /**
         * How the sender found the bot, e.g. via search of via a group.
         */
        readonly via: string,
    ) {}

    async handle(isAccept: boolean) {
        await this.bot[ctx].ops.call('handleFriendRequest', isAccept, this.fromUid);
    }
}