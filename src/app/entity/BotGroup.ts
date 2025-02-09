import { Bot } from '@/app';
import { BotContact, BotGroupMember } from '@/app/entity';
import { BotCacheService } from '@/app/util';
import { MessageType } from '@/core/message';
import { OutgoingMessage } from '@/core/message/outgoing';

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

export class BotGroup extends BotContact<BotGroupDataBinding> {
    private clientSequence = 100000;
    private readonly groupMemberCache;

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

    override async sendMsg(segments: OutgoingMessage['segments'], repliedSequence?: number) {
        return this.bot.ctx.ops.call('sendMessage', {
            type: MessageType.GroupMessage,
            groupUin: this.data.uin,
            clientSequence: this.clientSequence++,
            segments,
            repliedSequence
        });
    }
}