import { Bot, ctx, log } from '@/index';
import { BotEntity, BotGroup } from '@/entity';
import { GroupMemberPermission } from '@/internal/packet/oidb/0xfe7_3';

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

export { GroupMemberPermission } from '@/internal/packet/oidb/0xfe7_3';

export class BotGroupMember extends BotEntity<BotGroupMemberDataBinding> {
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
     * @param specialTitle The special title to set.
     * The length of the special title must be less than or equal to 18 (in UTF-8 bytes).
     * One CJK character takes 3 bytes.
     */
    async setSpecialTitle(specialTitle: string) {
        if (Buffer.from(specialTitle).length > 18) {
            throw new Error('Special title is too long');
        }
        this.bot[log].emit('debug', this.moduleName, `Set special title to ${specialTitle}`);
        await this.bot[ctx].ops.call('setMemberSpecialTitle', this.group.uin, this.uid, specialTitle);
        this.data.specialTitle = specialTitle;
    }

    /**
     * Send a gray tip poke to this member.
     */
    async sendGrayTipPoke() {
        this.bot[log].emit('debug', this.moduleName, 'Send gray tip poke');
        await this.bot[ctx].ops.call('sendGrayTipPoke', this.uin, this.group.uin);
    }
}