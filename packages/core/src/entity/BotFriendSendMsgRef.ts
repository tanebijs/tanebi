import { ctx } from '@/index';
import { BotFriend } from '@/entity';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';

export const raw = Symbol('PrivateMessage raw');

export class BotPrivateSendMsgRef {
    readonly [raw]: OutgoingPrivateMessage;

    constructor(
        readonly sequence: number,
        readonly timestamp: number,
        rawMsg: OutgoingPrivateMessage,
        readonly friend: BotFriend,
    ) {
        this[raw] = rawMsg;
    }

    /**
     * Recall this message
     */
    async recall() {
        await this.friend.bot[ctx].ops.call('recallFriendMessage',
            this.friend.uid, this[raw].clientSequence, this[raw].random, this.timestamp, this.sequence);
    }
}