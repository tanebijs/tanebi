export class BotFriendRequest {
    constructor(
        /**
         * The uin of who sent the friend request.
         */
        readonly fromUin: number,

        /**
         * The uid of who sent the friend request.
         */
        readonly fromUid: string,

        /**
         * The message with the friend request.
         */
        readonly message: string,

        /**
         * How the sender found the bot, e.g. via search of via a group.
         */
        readonly via: string,
    ) {}
}