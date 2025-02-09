import { Bot } from '@/app';
import { BotContact } from '@/app/entity';
import { MessageType } from '@/core/message';
import { OutgoingMessage } from '@/core/message/outgoing';

interface BotFriendDataBinding {
    uin: number;
    uid: string;
    nickname?: string;
    remark?: string;
    signature?: string;
    qid?: string;
    category: number;
}

export class BotFriend extends BotContact<BotFriendDataBinding> {
    private clientSequence = 100000;

    constructor(bot: Bot, data: BotFriendDataBinding) {
        super(bot, data);
    }

    get uid() {
        return this.data.uid;
    }

    get nickname() {
        return this.data.nickname;
    }

    get remark() {
        return this.data.remark;
    }

    get signature() {
        return this.data.signature;
    }

    get qid() {
        return this.data.qid;
    }

    get category() {
        return this.data.category;
    }

    override async sendMsg(segments: OutgoingMessage['segments'], repliedSequence?: number) {
        return this.bot.ctx.ops.call('sendMessage', {
            type: MessageType.PrivateMessage,
            targetUin: this.data.uin,
            targetUid: this.data.uid,
            clientSequence: this.clientSequence++,
            segments,
            repliedSequence,
        });
    }
}