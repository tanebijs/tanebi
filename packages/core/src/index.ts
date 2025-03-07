import { BotFriend, BotFriendMessage, BotGroup, BotGroupMember, BotGroupMessage, eventsFDX, eventsGDX } from '@/entity';
import { BotFriendRequest } from '@/entity/request/BotFriendRequest';
import { BotGroupInvitedJoinRequest } from '@/entity/request/BotGroupInvitedJoinRequest';
import { BotGroupJoinRequest } from '@/entity/request/BotGroupJoinRequest';
import { MessageDispatcher } from '@/message';
import { BotCacheService } from '@/util';
import { BotIdentityService } from '@/util/identity';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/internal';
import { TransEmp12_QrCodeState } from '@/internal/packet/login/wtlogin/TransEmp12';
import { EventEmitter } from 'node:events';
import { BotGroupInvitationRequest } from '@/entity/request/BotGroupInvitationRequest';

/**
 * Symbol of the bot context
 */
export const ctx = Symbol('Bot context');

/**
 * Symbol of the identity service
 */
export const identityService = Symbol('Identity service');

/**
 * Symbol of internal log
 */
export const log = Symbol('Internal log');

/**
 * Symbol of internal events
 */
export const eventsDX = Symbol('Internal events');

/**
 * The Bot object. Create an instance by calling `Bot.create`.
 */
export class Bot {
    readonly [ctx]: BotContext;
    readonly [identityService]: BotIdentityService;
    readonly [log] = new EventEmitter<{
        debug: [string, string]; // module, message
        info: [string, string]; // module, message
        warning: [string, string, unknown?]; // module, message, error
    }>();
    readonly [eventsDX] = new EventEmitter<{
        friendRequest: [BotFriendRequest];
        groupInvitationRequest: [BotGroupInvitationRequest];
    }>();
    private readonly friendCache;
    private readonly groupCache;
    private readonly messageDispatcher;
    private readonly globalMsg: MessageDispatcher['global'];

    /**
     * Whether the bot is logged in.
     */
    loggedIn = false;

    private heartbeatIntervalRef?: NodeJS.Timeout;

    private constructor(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        this[ctx] = new BotContext(appInfo, coreConfig, deviceInfo, keystore, signProvider);

        this[identityService] = new BotIdentityService(this);

        this.friendCache = new BotCacheService<number, BotFriend>(
            this,
            async (bot) => {
                // 全家4完了才能想出来这种分页的逻辑
                // -- quoted from https://github.com/LagrangeDev/Lagrange.Core/blob/master/Lagrange.Core/Internal/Service/System/FetchFriendsService.cs#L61
                let data = await bot[ctx].ops.call('fetchFriends');
                let friends = data.friends;
                while (data.nextUin) {
                    data = await bot[ctx].ops.call('fetchFriends', data.nextUin);
                    friends = friends.concat(data.friends);
                }
                friends.forEach(friend => {
                    this[identityService].uin2uid.set(friend.uin, friend.uid!);
                    this[identityService].uid2uin.set(friend.uid!, friend.uin);
                });

                return new Map(friends.map(friend => [friend.uin, {
                    uin: friend.uin,
                    uid: friend.uid!,
                    nickname: friend.nickname,
                    remark: friend.remark,
                    signature: friend.signature,
                    qid: friend.qid,
                    category: friend.category
                }]));
            },
            (bot, data) => new BotFriend(bot, data),
        );

        this.groupCache = new BotCacheService<number, BotGroup>(
            this,
            async (bot) => {
                const groupList = (await bot[ctx].ops.call('fetchGroups')).groups;
                return new Map(groupList.map(group => [group.groupUin, {
                    uin: group.groupUin,
                    name: group.info!.groupName!,
                    description: group.info?.description,
                    question: group.info?.question,
                    announcement: group.info?.announcement,
                    createdTime: group.info?.createdTime ?? 0,
                    maxMemberCount: group.info!.memberMax!,
                    memberCount: group.info!.memberCount!,
                }]));
            },
            (bot, data) => new BotGroup(bot, data),
        );

        this.messageDispatcher = new MessageDispatcher(this);
        this.globalMsg = this.messageDispatcher.global;

        this[ctx].events.on('messagePush', (data) => {
            try {
                if (data) {
                    this.messageDispatcher.emit(data);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle message', e);
            }
        });

        this[ctx].eventsDX.on('friendRequest', (fromUin, fromUid, message, via) => {
            this[log].emit('debug', 'Bot', `Received friend request from ${fromUid}`);
            this[eventsDX].emit('friendRequest', new BotFriendRequest(fromUin, fromUid, message, via));
        });

        this[ctx].eventsDX.on('friendPoke', async (fromUin, toUin, actionStr, actionImgUrl, suffix) => {
            this[log].emit('debug', 'Bot', `Received poke from ${fromUin} to ${toUin}`);
            try {
                const friend = await this.getFriend(fromUin === this.uin ? toUin : fromUin);
                if (friend) {
                    friend[eventsFDX].emit('poke', fromUin === this.uin, actionStr, actionImgUrl, suffix);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle friend poke', e);
            }
        });

        this[ctx].eventsDX.on('friendRecall', async (fromUid, clientSequence, tip) => {
            this[log].emit('debug', 'Bot', `Received recall from ${fromUid}`);
            try {
                const friendUin = await this[identityService].resolveUin(fromUid);
                if (!friendUin) return;
                const friend = await this.getFriend(friendUin);
                if (friend) {
                    friend[eventsFDX].emit('recall', clientSequence, tip);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle friend recall', e);
            }
        });

        this[ctx].eventsDX.on('groupJoinRequest', async (groupUin, memberUid) => {
            this[log].emit('debug', 'Bot', `Received join request from ${memberUid} in group ${groupUin}`);
            try {
                const request = await BotGroupJoinRequest.create(groupUin, memberUid, this);
                if (request) {
                    (await this.getGroup(groupUin))?.[eventsGDX].emit('joinRequest', request);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle join request', e);
            }
        });

        this[ctx].eventsDX.on('groupInvitedJoinRequest', async (groupUin, targetUid, invitorUid) => {
            this[log].emit('debug', 'Bot', `Received invited join request from ${invitorUid} to ${targetUid} in group ${groupUin}`);
            try {
                const request = await BotGroupInvitedJoinRequest.create(groupUin, targetUid, invitorUid, this);
                if (request) {
                    (await this.getGroup(groupUin))?.[eventsGDX].emit('invitedJoinRequest', request);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle invited join request', e);
            }
        });

        this[ctx].eventsDX.on('groupAdminChange', async (groupUin, targetUid, isPromote) => {
            this[log].emit('debug', 'Bot', `Received admin change in group ${groupUin} for ${targetUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(targetUid);
                    if (!uin) return;
                    const member = await group.getMember(uin);
                    if (member) {
                        group[eventsGDX].emit('adminChange', member, isPromote);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle admin change', e);
            }
        });

        this[ctx].eventsDX.on('groupMemberIncrease', async (groupUin, memberUid, operatorUid) => {
            this[log].emit('debug', 'Bot', `Received member increase in group ${groupUin} for ${memberUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(memberUid);
                    if (!uin) return;
                    const member = await group.getMember(uin);
                    if (member) {
                        if (operatorUid) {
                            const operatorUin = await this[identityService].resolveUin(operatorUid);
                            if (!operatorUin) return;
                            const operator = await group.getMember(operatorUin);
                            if (operator) {
                                group[eventsGDX].emit('memberIncrease', member, operator);
                            }
                        } else {
                            group[eventsGDX].emit('memberIncrease', member);
                        }
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle member increase', e);
            }
        });

        this[ctx].eventsDX.on('groupMemberDecrease', async (groupUin, memberUid, operatorUid) => {
            this[log].emit('debug', 'Bot', `Received member decrease in group ${groupUin} for ${memberUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(memberUid);
                    if (!uin) return;
                    if (operatorUid) {
                        const operatorUin = await this[identityService].resolveUin(operatorUid);
                        if (!operatorUin) return;
                        const operator = await group.getMember(operatorUin);
                        if (operator) {
                            group[eventsGDX].emit('memberKick', uin, operator);
                        }
                    } else {
                        group[eventsGDX].emit('memberLeave', uin);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle member decrease', e);
            }
        });

        this[ctx].eventsDX.on('groupMute', async (groupUin, operatorUid, targetUid, duration) => {
            this[log].emit('debug', 'Bot', `Received mute in group ${groupUin} for ${targetUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(targetUid);
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!uin || !operatorUin) return;
                    const member = await group.getMember(uin);
                    const operator = await group.getMember(operatorUin);
                    if (member && operator) {
                        if (duration === 0) {
                            group[eventsGDX].emit('unmute', member, operator);
                        } else {
                            group[eventsGDX].emit('mute', member, operator, duration);
                        }
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle mute', e);
            }
        });

        this[ctx].eventsDX.on('groupMuteAll', async (groupUin, operatorUid, isSet) => {
            this[log].emit('debug', 'Bot', `Received mute all in group ${groupUin} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        group[eventsGDX].emit('muteAll', operator, isSet);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle mute all', e);
            }
        });

        this[ctx].eventsDX.on('groupPoke', async (groupUin, fromUin, toUin, actionStr, actionImgUrl, suffix) => {
            this[log].emit('debug', 'Bot', `Received poke in group ${groupUin} from ${fromUin} to ${toUin}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const sender = await group.getMember(fromUin);
                    const receiver = await group.getMember(toUin);
                    if (sender && receiver) {
                        group[eventsGDX].emit('poke', sender, receiver, actionStr, actionImgUrl, suffix);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group poke', e);
            }
        });

        this[ctx].eventsDX.on('groupEssenceMessageChange', async (groupUin, sequence, operatorUin, isAdd) => {
            this[log].emit('debug', 'Bot', `Received essence message change in group ${groupUin} by ${operatorUin}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        group[eventsGDX].emit('essenceMessageChange', sequence, operator, isAdd);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle essence message change', e);
            }
        });

        this[ctx].eventsDX.on('groupRecall', async (groupUin, sequence, tip, operatorUid) => {
            this[log].emit('debug', 'Bot', `Received recall in group ${groupUin} for message ${sequence} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        group[eventsGDX].emit('recall', sequence, tip, operator);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group recall', e);
            }
        });

        this[ctx].eventsDX.on('groupReaction', async (groupUin, sequence, operatorUid, reactionCode, isAdd, count) => {
            this[log].emit('debug', 'Bot', `Received reaction in group ${groupUin} for message ${sequence} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        group[eventsGDX].emit('reaction', sequence, operator, reactionCode, isAdd, count);
                    }
                }
            } catch(e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group reaction', e);
            }
        });
    }

    public get uin() {
        return this[ctx].keystore.uin === 0 ? undefined : this[ctx].keystore.uin;
    }
    
    /**
     * Login with QR code, accepts a callback function to handle QR code
     * @param onQrCode Callback function to handle QR code
     * @param queryQrCodeResultInterval Interval to query QR code result, >= 2000ms, 5000ms by default
     */
    async qrCodeLogin(
        onQrCode: (qrCodeUrl: string, qrCodePng: Buffer) => unknown,
        queryQrCodeResultInterval: number = 5000,
    ) {
        queryQrCodeResultInterval = Math.max(queryQrCodeResultInterval, 2000);

        const qrCodeInfo = await this[ctx].ops.call('fetchQrCode');
        this[log].emit('debug', 'Bot', `QR code info: ${JSON.stringify(qrCodeInfo)}`);

        this[ctx].keystore.session.qrSign = qrCodeInfo.signature;
        this[ctx].keystore.session.qrString = qrCodeInfo.qrSig;
        this[ctx].keystore.session.qrUrl = qrCodeInfo.url;
        onQrCode(qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            const qrCodeResultLoop = setInterval(async () => {
                const res = await this[ctx].ops.call('queryQrCodeResult');
                this[log].emit('debug', 'Bot', `Query QR code result: ${res.confirmed ? 'confirmed' : res.state}`);
                if (res.confirmed) {
                    clearInterval(qrCodeResultLoop);
                    this[ctx].keystore.session.tempPassword = res.tempPassword;
                    this[ctx].keystore.session.noPicSig = res.noPicSig;
                    this[ctx].keystore.stub.tgtgtKey = res.tgtgtKey;
                    resolve();
                } else {
                    if (res.state === TransEmp12_QrCodeState.CodeExpired || res.state === TransEmp12_QrCodeState.Canceled) {
                        clearInterval(qrCodeResultLoop);
                        reject(new Error('Session expired or cancelled'));
                    }
                }
            }, queryQrCodeResultInterval);
        });

        this[ctx].keystore.uin = await this[ctx].wtLoginLogic.getCorrectUin();
        this[log].emit('info', 'Bot', `User ${this.uin} scanned QR code`);

        const loginResult = await this[ctx].ops.call('wtLogin');
        if (!loginResult.success) {
            throw new Error(`Login failed (state=${loginResult.state} tag=${loginResult.tag} message=${loginResult.message})`);
        }

        this[ctx].keystore.uid = loginResult.uid;

        this[ctx].keystore.session.d2Key = loginResult.session.d2Key;
        this[ctx].keystore.session.tgt = loginResult.session.tgt;
        this[ctx].keystore.session.d2 = loginResult.session.d2;
        this[ctx].keystore.session.tempPassword = loginResult.session.tempPassword;
        this[ctx].keystore.session.sessionDate = loginResult.session.sessionDate;

        this[ctx].keystore.info = loginResult.info;

        this[log].emit('debug', 'Bot', `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[log].emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);
        this[log].emit('info', 'Bot',
            `Name: ${this[ctx].keystore.info.name}; Gender: ${this[ctx].keystore.info.gender}; Age: ${this[ctx].keystore.info.age}`);

        await this.botOnline();
    }

    /**
     * Try getting online using existing session first;
     * if failed, refresh session and try NTEasyLogin
     */
    async fastLogin() {
        try {
            await this.botOnline();
        } catch {
            await this.keyExchange();
            await this.ntEasyLogin();
        }
    }

    /**
     * Perform key exchange to refresh session
     */
    async keyExchange() {
        const keyExchangeResult = await this[ctx].ops.call('keyExchange');
        this[ctx].keystore.session.exchangeKey = keyExchangeResult.gcmKey;
        this[ctx].keystore.session.keySign = keyExchangeResult.sign;
    }

    /**
     * Perform easy login using exchanged key.
     * Do not confuse this with `fastLogin`, which tries to get online using existing session first.
     * You should always rely on `fastLogin` unless you know what you are doing.
     */
    async ntEasyLogin() {
        const easyLoginResult = await this[ctx].ops.call('ntEasyLogin');
        if (!easyLoginResult.success) {
            throw new Error(`Login failed (${easyLoginResult.errorCode})`);
        }

        this[ctx].keystore.session.d2Key = easyLoginResult.d2Key;
        this[ctx].keystore.session.tgt = easyLoginResult.tgt;
        this[ctx].keystore.session.d2 = easyLoginResult.d2;
        this[ctx].keystore.session.tempPassword = easyLoginResult.tempPassword;
        this[ctx].keystore.session.sessionDate = easyLoginResult.sessionDate;
        
        this[log].emit('debug', 'Bot', `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[log].emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);

        await this.botOnline();
    }

    /**
     * Get online using existing session
     */
    async botOnline() {
        const onlineResult = await this[ctx].ops.call('botOnline');
        if (!(onlineResult?.includes('register success'))) {
            throw new Error(`Failed to go online (${onlineResult})`);
        }

        this.loggedIn = true;
        this[log].emit('info', 'Bot', `User ${this.uin} is now online`);

        this.heartbeatIntervalRef = setInterval(() => {
            this[ctx].ops.call('heartbeat');
            this[log].emit('debug', 'Bot', 'Heartbeat sent');
        }, 4.5 * 60 * 1000 /* 4.5 minute */);
    }

    /**
     * Get all friends
     * @param forceUpdate Whether to force update the friend list
     */
    async getFriends(forceUpdate = false) {
        this[log].emit('debug', 'Bot', 'Getting friends');
        return this.friendCache.getAll(forceUpdate);
    }

    /**
     * Get a friend by Uin
     * @param uin Uin of the friend
     * @param forceUpdate Whether to force update the friend info
     */
    async getFriend(uin: number, forceUpdate = false) {
        this[log].emit('debug', 'Bot', `Getting friend ${uin}`);
        return this.friendCache.get(uin, forceUpdate);
    }

    /**
     * Get all groups
     * @param forceUpdate Whether to force update the group list
     */
    async getGroups(forceUpdate = false) {
        this[log].emit('debug', 'Bot', 'Getting groups');
        return this.groupCache.getAll(forceUpdate);
    }

    /**
     * Get a group by Uin
     * @param uin Uin of the group
     * @param forceUpdate Whether to force update the group info
     */
    async getGroup(uin: number, forceUpdate = false) {
        this[log].emit('debug', 'Bot', `Getting group ${uin}`);
        return this.groupCache.get(uin, forceUpdate);
    }

    /**
     * Listen to private messages
     */
    onPrivateMessage(listener: (friend: BotFriend, message: BotFriendMessage) => void) {
        this.globalMsg.on('private', listener);
    }

    /**
     * Listen to group messages
     */
    onGroupMessage(listener: (group: BotGroup, sender: BotGroupMember, message: BotGroupMessage) => void) {
        this.globalMsg.on('group', listener);
    }

    /**
     * Listen to friend requests
     */
    onFriendRequest(listener: (request: BotFriendRequest) => void) {
        this[eventsDX].on('friendRequest', listener);
    }

    /**
     * Listen to group invitation requests
     */
    onGroupInvitationRequest(listener: (request: BotGroupInvitationRequest) => void) {
        this[eventsDX].on('groupInvitationRequest', listener);
    }

    /**
     * Listen to debug logs
     */
    onDebug(listener: (module: string, message: string) => void) {
        this[log].on('debug', listener);
    }

    /**
     * Listen to info logs
     */
    onInfo(listener: (module: string, message: string) => void) {
        this[log].on('info', listener);
    }

    /**
     * Listen to warning logs
     */
    onWarning(listener: (module: string, message: string, error?: unknown) => void) {
        this[log].on('warning', listener);
    }
    
    /**
     * Create a new Bot instance and complete necessary initialization
     */
    static async create(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        const bot = new Bot(appInfo, coreConfig, deviceInfo, keystore, signProvider);
        await bot[ctx].ssoLogic.connectToMsfServer();
        await bot[ctx].ops.call('fetchHighwayUrl')
            .then(data => {
                const { ip, port } = data.serverInfo[0];
                bot[ctx].highwayLogic.setHighwayUrl(ip, port, data.sigSession);
            });
        return bot;
    }
}

export * from './entity';
export * from './message';
export * from './util';