import { Bot, ctx, log } from '@/app';
import { BotContact } from '@/app/entity';
import { DispatchedMessage, PrivateMessageBuilder } from '@/app/message';
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
    clientSequence: number;
    random: number;
    isSelf: boolean;
    repliedSequence?: number;
} & DispatchedMessage;

export const eventsFDX = Symbol('Friend internal events');

export class BotFriend extends BotContact<BotFriendDataBinding> {
    private readonly [eventsFDX] = new EventEmitter<{
        message: [BotFriendMessage],
    }>();
    private readonly moduleName = `BotFriend#${this.uin}`;
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

    /**
     * Send a message to this friend
     * @param buildMsg Use this function to add segments to the message
     * @returns The message sequence number and timestamp
     */
    async sendMsg(buildMsg: (b: PrivateMessageBuilder) => void | Promise<void>) {
        this.bot[log].emit('debug', this.moduleName, 'Send message');
        const builder = new PrivateMessageBuilder(this);
        await buildMsg(builder);
        return this.bot[ctx].ops.call('sendMessage', builder.build(this.clientSequence++));
    }

    /**
     * Send a gray tip poke to this friend
     */
    async sendGrayTipPoke() {
        this.bot[log].emit('debug', this.moduleName, 'Send gray tip poke');
        await this.bot[ctx].ops.call('sendGrayTipPoke', this.uin, undefined, this.uin);
    }

    /**
     * Subscribe to incoming messages from this friend
     * @param listener The listener function
     */
    onMessage(listener: (message: BotFriendMessage) => void) {
        this[eventsFDX].on('message', listener);
    }
}