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

export class BotFriend extends BotContact<BotFriendDataBinding> {
    private clientSequence = 100000;
    private messageChannel: EventEmitter<{
        message: [DispatchedMessage, boolean /* isSelf */, number /* sequence */],
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

    override async sendMsg(segments: OutgoingSegment[], repliedSequence?: number) {
        return this.bot.ctx.ops.call('sendMessage', {
            type: MessageType.PrivateMessage,
            targetUin: this.data.uin,
            targetUid: this.data.uid,
            clientSequence: this.clientSequence++,
            segments,
            repliedSequence,
        });
    }

    onMessage(listener: (message: DispatchedMessage, isSelf: boolean, sequence: number) => void) {
        this.messageChannel.on('message', listener);
    }

    dispatchMessage(message: DispatchedMessage, isSelf: boolean, sequence: number) {
        this.messageChannel.emit('message', message, isSelf, sequence);
    }
}