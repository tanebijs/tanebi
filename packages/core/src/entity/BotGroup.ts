import { Bot, ctx, identityService, log } from '@/index';
import { BotContact, BotGroupMember, ReactionType } from '@/entity';
import { BotGroupInvitedJoinRequest } from '@/entity/request/BotGroupInvitedJoinRequest';
import { BotGroupJoinRequest } from '@/entity/request/BotGroupJoinRequest';
import { DispatchedMessage, GroupMessageBuilder } from '@/message';
import { BotCacheService } from '@/util';
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

export const eventsGDX = Symbol('Group internal events');

export class BotGroup extends BotContact<BotGroupDataBinding> {
    [eventsGDX]: EventEmitter<{
        message: [BotGroupMessage];
        joinRequest: [BotGroupJoinRequest];
        invitedJoinRequest: [BotGroupInvitedJoinRequest];
        adminChange: [BotGroupMember, boolean]; // member, isPromote
        memberIncrease: [BotGroupMember, BotGroupMember?]; // member, operator
        memberLeave: [number]; // uin
        memberKick: [number, BotGroupMember]; // uin, operator
        mute: [BotGroupMember, BotGroupMember, number]; // member, operator, duration
        unmute: [BotGroupMember, BotGroupMember]; // member, operator
        muteAll: [BotGroupMember, boolean]; // operator, isSet
        poke: [BotGroupMember, BotGroupMember, string, string, string?]; // sender, receiver, actionStr, actionImgUrl, suffix
        essenceMessageChange: [number, BotGroupMember, boolean]; // sequence, operator, isAdd
        recall: [number, string, BotGroupMember]; // clientSequence, tip, operator
        reaction: [number, BotGroupMember, string, boolean, number]; // sequence, member, reactionCode, isAdd, count
    }> = new EventEmitter();

    private clientSequence = 100000;
    private readonly groupMemberCache;
    private readonly moduleName = `BotGroup#${this.uin}`;

    constructor(bot: Bot, data: BotGroupDataBinding) {
        super(bot, data);

        this.groupMemberCache = new BotCacheService<number, BotGroupMember>(
            bot,
            async (bot) => {
                let data = await bot[ctx].ops.call('fetchGroupMembers', this.data.uin);
                let members = data.members;
                while (data.token) {
                    data = await bot[ctx].ops.call('fetchGroupMembers', this.data.uin, data.token);
                    members = members.concat(data.members);
                }
                members.forEach(member => {
                    bot[identityService].uin2uid.set(member.identity.uin, member.identity.uid!);
                    bot[identityService].uid2uin.set(member.identity.uid!, member.identity.uin);
                });

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
        this.bot[log].emit('debug', this.moduleName, 'Get all members');
        return this.groupMemberCache.getAll(forceUpdate);
    }

    /**
     * Get a member in this group
     * @param uin Uin of the member
     * @param forceUpdate Whether to force update the member info
     */
    async getMember(uin: number, forceUpdate = false) {
        this.bot[log].emit('debug', this.moduleName, `Get member ${uin}`);
        return this.groupMemberCache.get(uin, forceUpdate);
    }

    /**
     * Send a message to this group
     * @param buildMsg Use this function to add segments to the message
     * @returns The message sequence number and timestamp
     */
    async sendMsg(buildMsg: (b: GroupMessageBuilder) => void | Promise<void>) {
        this.bot[log].emit('debug', this.moduleName, 'Send message');
        const builder = new GroupMessageBuilder(this);
        await buildMsg(builder);
        return this.bot[ctx].ops.call('sendMessage', builder.build(this.clientSequence++));
    }

    /**
     * Recall a message in this group.
     * To recall others' messages, you must be the owner / an admin of the group.
     */
    async recallMsg(sequence: number) {
        this.bot[log].emit('debug', this.moduleName, `Recall message ${sequence}`);
        await this.bot[ctx].ops.call('recallGroupMessage', this.uin, sequence);
    }

    /**
     * Send a reaction to a message in this group
     * @param sequence The sequence number of the message
     * @param code The code of reaction. Refer to the [reaction code list](https://bot.q.qq.com/wiki/develop/api/openapi/emoji/model.html) for more information.
     * @param type The type of reaction corresponding to the message. Also refer to the reaction code list.
     * `1` for `ReactionType.Face`; `2` for `ReactionType.Emoji`.
     * @param isAdd Whether to add the reaction. If false, remove the reaction.
     */
    async sendReaction(sequence: number, code: string, type: ReactionType, isAdd: boolean) {
        this.bot[log].emit('debug', this.moduleName, `Send reaction ${isAdd ? 'add' : 'remove'} ${code}`);
        if (isAdd) {
            await this.bot[ctx].ops.call('addGroupReaction', this.uin, sequence, code, type);
        } else {
            await this.bot[ctx].ops.call('removeGroupReaction', this.uin, sequence, code, type);
        }
    }

    /**
     * Listen to messages in this group
     */
    onMessage(listener: (message: BotGroupMessage) => void) {
        this[eventsGDX].on('message', listener);
    }

    /**
     * Listen to join requests in this group
     */
    onJoinRequest(listener: (request: BotGroupJoinRequest) => void) {
        this[eventsGDX].on('joinRequest', listener);
    }

    /**
     * Listen to invited join requests in this group
     */
    onInvitedJoinRequest(listener: (request: BotGroupInvitedJoinRequest) => void) {
        this[eventsGDX].on('invitedJoinRequest', listener);
    }

    /**
     * Listen to admin changes in this group
     */
    onAdminChange(listener: (member: BotGroupMember, isPromote: boolean) => void) {
        this[eventsGDX].on('adminChange', listener);
    }

    /**
     * Listen to member increase events in this group
     */
    onMemberIncrease(listener: (member: BotGroupMember, operator?: BotGroupMember) => void) {
        this[eventsGDX].on('memberIncrease', listener);
    }

    /**
     * Listen to member leave events in this group
     */
    onMemberLeave(listener: (uin: number) => void) {
        this[eventsGDX].on('memberLeave', listener);
    }

    /**
     * Listen to member kick events in this group
     */
    onMemberKick(listener: (uin: number, operator: BotGroupMember) => void) {
        this[eventsGDX].on('memberKick', listener);
    }

    /**
     * Listen to mute events in this group
     */
    onMute(listener: (member: BotGroupMember, operator: BotGroupMember, duration: number) => void) {
        this[eventsGDX].on('mute', listener);
    }

    /**
     * Listen to unmute events in this group
     */
    onUnmute(listener: (member: BotGroupMember, operator: BotGroupMember) => void) {
        this[eventsGDX].on('unmute', listener);
    }

    /**
     * Listen to mute all events in this group
     */
    onMuteAll(listener: (operator: BotGroupMember, isSet: boolean) => void) {
        this[eventsGDX].on('muteAll', listener);
    }

    /**
     * Listen to poke events in this group
     */
    onPoke(listener: (sender: BotGroupMember, receiver: BotGroupMember, actionStr: string, actionImgUrl: string, suffix?: string) => void) {
        this[eventsGDX].on('poke', listener);
    }

    /**
     * Listen to essence message change events in this group
     */
    onEssenceMessageChange(listener: (sequence: number, operator: BotGroupMember, isAdd: boolean) => void) {
        this[eventsGDX].on('essenceMessageChange', listener);
    }

    /**
     * Listen to recall events in this group
     */
    onRecall(listener: (sequence: number, tip: string, operator: BotGroupMember) => void) {
        this[eventsGDX].on('recall', listener);
    }

    /**
     * Listen to reaction events in this group
     */
    onReaction(listener: (sequence: number, member: BotGroupMember, reactionCode: string, isAdd: boolean, count: number) => void) {
        this[eventsGDX].on('reaction', listener);
    }
}

export { ReactionType } from '@/internal/packet/oidb/0x9082_1';