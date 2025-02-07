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
}