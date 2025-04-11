import { Bot, log } from '@/index';

export class BotIdentityService {
    readonly uin2uid = new Map<number, string>();
    readonly uid2uin = new Map<string, number>();

    constructor(private readonly bot: Bot) {}

    async resolveUid(uin: number, groupUin?: number) {
        const uid = this.uin2uid.get(uin);
        if (uid) return uid;
        
        this.bot[log].emit('trace', 'BotIdentityService', `Cache miss, resolving Uin ${uin} to Uid`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        const result = this.uin2uid.get(uin);
        if (!result) {
            this.bot[log].emit('warning', 'BotIdentityService', `Failed to resolve Uin ${uin} to Uid` +
                groupUin ? ` in group ${groupUin}` : ''
            );
        }
        return result;
    }

    async resolveUin(uid: string, groupUin?: number) {
        const uin = this.uid2uin.get(uid);
        if (uin) return uin;
        
        this.bot[log].emit('trace', 'BotIdentityService', `Cache miss, resolving Uid ${uid} to Uin`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        const result = this.uid2uin.get(uid);
        if (!result) {
            this.bot[log].emit('warning', 'BotIdentityService', `Failed to resolve Uid ${uid} to Uin` + 
                groupUin ? ` in group ${groupUin}` : ''
            );
        }
        return result;
    }
}