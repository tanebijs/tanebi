import { Bot } from '@/app';
import { BotEntity, BotGroup } from '@/app/entity';
import { GroupMemberPermission } from '@/core/packet/oidb/0xfe7_3';

interface BotGroupMemberDataBinding {
    uin: number;
    uid: string;
    nickname?: string;
    card?: string;
    level: number;
    specialTitle?: string;
    joinTime: number;
    lastMsgTime: number;
    shutUpTime?: number;
    permission: GroupMemberPermission;
}

export { GroupMemberPermission } from '@/core/packet/oidb/0xfe7_3';

export class BotGroupMember extends BotEntity<BotGroupMemberDataBinding> {
    private clientSequence = 100000;
    private readonly moduleName = `BotGroupMember#${this.uin}@${this.group.uin}`;

    constructor(bot: Bot, data: BotGroupMemberDataBinding, readonly group: BotGroup) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }

    get uid() {
        return this.data.uid;
    }

    get nickname() {
        return this.data.nickname;
    }

    get card() {
        return this.data.card;
    }

    get level() {
        return this.data.level;
    }

    get specialTitle() {
        return this.data.specialTitle;
    }

    get joinTime() {
        return this.data.joinTime;
    }

    get lastMsgTime() {
        return this.data.lastMsgTime;
    }

    get shutUpTime() {
        return this.data.shutUpTime;
    }

    get permission() {
        return this.data.permission;
    }

    /**
     * Set the special title of this member.
     * You must be the owner of the group to do this.
     */
    async setSpecialTitle(specialTitle: string) {
        this.bot.log.emit('debug', this.moduleName, `Set special title to ${specialTitle}`);
        await this.bot.ctx.ops.call('setMemberSpecialTitle', this.group.uin, this.uid, specialTitle);
    }

    /**
     * Send a gray tip poke to this member.
     */
    async sendGrayTipPoke() {
        this.bot.log.emit('debug', this.moduleName, 'Send gray tip poke');
        await this.bot.ctx.ops.call('sendGrayTipPoke', this.uin, this.group.uin);
    }
}