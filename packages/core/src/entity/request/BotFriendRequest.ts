export class BotFriendRequest {
    constructor(
        readonly fromUin: number,
        readonly fromUid: string,
        readonly message: string,

        /**
         * How the sender found the bot, e.g. via search of via a group.
         */
        readonly via: string,
    ) {}
}