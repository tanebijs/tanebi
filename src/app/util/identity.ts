import { Bot } from '@/app';

export class BotIdentityService {
    readonly uin2uid = new Map<number, string>();
    readonly uid2uin = new Map<string, number>();

    constructor(private readonly bot: Bot) {}

    async resolveUid(uin: number, groupUin?: number) {
        const uid = this.uin2uid.get(uin);
        if (uid) return uid;
        
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        return this.uin2uid.get(uin);
    }

    async resolveUin(uid: string, groupUin?: number) {
        const uin = this.uid2uin.get(uid);
        if (uin) return uin;
        
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        return this.uid2uin.get(uid);
    }
}