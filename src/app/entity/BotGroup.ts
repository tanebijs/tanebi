import { Bot } from '@/app';
import { BotContact, BotGroupMember } from '@/app/entity';
import { DispatchedMessage, GroupMessageBuilder } from '@/app/message';
import { BotCacheService } from '@/app/util';
import EventEmitter from 'node:events';

interface BotGroupDataBinding {
    uin: number;
    name: string;
    description?: string;
    question?: string;
    announcement?: string;
    createdTime: number;
    maxMemberCount: number;
    memberCount: number;
}

export type BotGroupMessage = {
    sequence: number;
    sender: BotGroupMember;
    repliedSequence?: number;
} & DispatchedMessage;

export class BotGroup extends BotContact<BotGroupDataBinding> {
    clientSequence = 100000;
    private readonly groupMemberCache;
    private messageChannel: EventEmitter<{
        message: [BotGroupMessage];
    }> = new EventEmitter();

    constructor(bot: Bot, data: BotGroupDataBinding) {
        super(bot, data);

        this.groupMemberCache = new BotCacheService<number, BotGroupMember>(
            bot,
            async (bot) => {
                let data = await bot.ctx.ops.call('fetchGroupMembers', this.data.uin);
                let members = data.members;
                while (data.token) {
                    data = await bot.ctx.ops.call('fetchGroupMembers', this.data.uin, data.token);
                    members = members.concat(data.members);
                }

                return new Map(members.map(member => [member.identity.uin, {
                    uin: member.identity.uin,
                    uid: member.identity.uid!,
                    nickname: member.memberName,
                    card: member.memberCard?.value,
                    level: member.level?.level ?? 0,
                    specialTitle: member.specialTitle ? Buffer.from(member.specialTitle).toString('utf-8') : undefined,
                    joinTime: member.joinTimestamp,
                    lastMsgTime: member.lastMsgTimestamp,
                    shutUpTime: member.shutUpTimestamp,
                    permission: member.permission,
                }]));
            },
            (bot, data) => new BotGroupMember(bot, data, this),
        );
    }

    get name() {
        return this.data.name;
    }

    get description() {
        return this.data.description;
    }

    get question() {
        return this.data.question;
    }

    get announcement() {
        return this.data.announcement;
    }

    get createdTime() {
        return this.data.createdTime;
    }

    get maxMemberCount() {
        return this.data.maxMemberCount;
    }

    get memberCount() {
        return this.data.memberCount;
    }

    /**
     * Get all members in this group
     * @param forceUpdate Whether to force update the cache
     */
    async getMembers(forceUpdate = false) {
        return this.groupMemberCache.getAll(forceUpdate);
    }

    /**
     * Get a member in this group
     * @param uin Uin of the member
     * @param forceUpdate Whether to force update the member info
     */
    async getMember(uin: number, forceUpdate = false) {
        return this.groupMemberCache.get(uin, forceUpdate);
    }

    /**
     * Send a message to this group
     * @param buildMsg Use this function to add segments to the message
     * @returns The message sequence number and timestamp
     */
    async sendMsg(buildMsg: (b: GroupMessageBuilder) => void | Promise<void>) {
        const builder = new GroupMessageBuilder(this);
        await buildMsg(builder);
        return this.bot.ctx.ops.call('sendMessage', builder.build());
    }

    /**
     * Listen to messages in this group
     */
    onMessage(listener: (message: BotGroupMessage) => void) {
        this.messageChannel.on('message', listener);
    }

    dispatchMessage(message: BotGroupMessage) {
        this.messageChannel.emit('message', message);
    }
}