import { Bot } from '@/app';
import { BotContact } from '@/app/entity';
import { DispatchedMessage } from '@/app/message';
import { MessageType } from '@/core/message';
import { OutgoingSegment } from '@/core/message/outgoing';
import EventEmitter from 'node:events';

interface BotFriendDataBinding {
    uin: number;
    uid: string;
    nickname?: string;
    remark?: string;
    signature?: string;
    qid?: string;
    category: number;
}

export type BotFriendMessage = {
    sequence: number;
    isSelf: boolean;
    repliedSequence?: number;
} & DispatchedMessage;

export class BotFriend extends BotContact<BotFriendDataBinding> {
    private clientSequence = 100000;
    private messageChannel: EventEmitter<{
        message: [BotFriendMessage],
    }> = new EventEmitter();

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

    async sendMsg(segments: OutgoingSegment[], repliedSequence?: number) {
        return this.bot.ctx.ops.call('sendMessage', {
            type: MessageType.PrivateMessage,
            targetUin: this.data.uin,
            targetUid: this.data.uid,
            clientSequence: this.clientSequence++,
            segments,
            repliedSequence,
        });
    }

    onMessage(listener: (message: BotFriendMessage) => void) {
        this.messageChannel.on('message', listener);
    }

    dispatchMessage(message: BotFriendMessage) {
        this.messageChannel.emit('message', message);
    }
}