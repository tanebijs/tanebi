import { ctx } from '@/index';
import { BotFriend } from '@/entity';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';

export class BotPrivateSendMsgRef {
    constructor(
        readonly sequence: number,
        readonly timestamp: number,
        readonly raw: OutgoingPrivateMessage,
        readonly friend: BotFriend,
    ) {}

    /**
     * Recall this message
     */
    async recall() {
        await this.friend.bot[ctx].ops.call('recallFriendMessage', this.friend.uid, this.raw.clientSequence, this.raw.random, this.timestamp, this.sequence);
    }
}