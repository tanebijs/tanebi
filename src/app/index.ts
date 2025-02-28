import { BotFriend, BotGroup } from '@/app/entity';
import { BotGroupInvitedJoinRequest } from '@/app/entity/request/BotGroupInvitedJoinRequest';
import { BotGroupJoinRequest } from '@/app/entity/request/BotGroupJoinRequest';
import { MessageDispatcher } from '@/app/message';
import { BotCacheService } from '@/app/util';
import { BotIdentityService } from '@/app/util/identity';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/core';
import { TransEmp12_QrCodeState } from '@/core/packet/login/wtlogin/TransEmp12';
import { EventEmitter } from 'node:events';

/**
 * The Bot object. Create an instance by calling `Bot.create`.
 */
export class Bot {
    /**
     * The BotContext object. Use this to access low-level APIs.
     */
    readonly ctx;

    /**
     * The service for identity resolution.
     */
    readonly identityService;

    /**
     * Whether the bot is logged in.
     */
    loggedIn = false;

    /**
     * Global message dispatcher. Use this to listen to all incoming messages.
     */
    readonly globalMsg: MessageDispatcher['global'];

    /**
     * Log emitter
     */
    readonly log;

    private readonly friendCache;
    private readonly groupCache;
    private readonly messageDispatcher;
    private heartbeatIntervalRef?: NodeJS.Timeout;

    private constructor(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        this.ctx = new BotContext(appInfo, coreConfig, deviceInfo, keystore, signProvider);

        this.log = new EventEmitter<{
            debug: [string, string]; // module, message
            info: [string, string]; // module, message
            warning: [string, string, unknown?]; // module, message, error
        }>();

        this.identityService = new BotIdentityService(this);

        this.friendCache = new BotCacheService<number, BotFriend>(
            this,
            async (bot) => {
                // 全家4完了才能想出来这种分页的逻辑
                // -- quoted from https://github.com/LagrangeDev/Lagrange.Core/blob/master/Lagrange.Core/Internal/Service/System/FetchFriendsService.cs#L61
                let data = await bot.ctx.ops.call('fetchFriends');
                let friends = data.friends;
                while (data.nextUin) {
                    data = await bot.ctx.ops.call('fetchFriends', data.nextUin);
                    friends = friends.concat(data.friends);
                }
                friends.forEach(friend => {
                    this.identityService.uin2uid.set(friend.uin, friend.uid!);
                    this.identityService.uid2uin.set(friend.uid!, friend.uin);
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
                const groupList = (await bot.ctx.ops.call('fetchGroups')).groups;
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

        this.ctx.events.on('messagePush', (data) => {
            try {
                if (data) {
                    this.messageDispatcher.emit(data);
                }
            } catch (e) {
                this.log.emit('warning', 'Bot', 'Failed to handle message', e);
            }
        });

        this.ctx.eventsDX.on('groupJoinRequest', async (groupUin, memberUid) => {
            this.log.emit('debug', 'Bot', `Received join request from ${memberUid} in group ${groupUin}`);
            try {
                const request = await BotGroupJoinRequest.create(groupUin, memberUid, this);
                if (request) {
                    (await this.getGroup(groupUin))?.eventsDX.emit('joinRequest', request);
                }
            } catch (e) {
                this.log.emit('warning', 'Bot', 'Failed to handle join request', e);
            }
        });

        this.ctx.eventsDX.on('groupInvitedJoinRequest', async (groupUin, targetUid, invitorUid) => {
            this.log.emit('debug', 'Bot', `Received invited join request from ${invitorUid} to ${targetUid} in group ${groupUin}`);
            try {
                const request = await BotGroupInvitedJoinRequest.create(groupUin, targetUid, invitorUid, this);
                if (request) {
                    (await this.getGroup(groupUin))?.eventsDX.emit('invitedJoinRequest', request);
                }
            } catch (e) {
                this.log.emit('warning', 'Bot', 'Failed to handle invited join request', e);
            }
        });
    }

    public get uin() {
        return this.ctx.keystore.uin === 0 ? undefined : this.ctx.keystore.uin;
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

        const qrCodeInfo = await this.ctx.ops.call('fetchQrCode');
        this.log.emit('debug', 'Bot', `QR code info: ${JSON.stringify(qrCodeInfo)}`);

        this.ctx.keystore.session.qrSign = qrCodeInfo.signature;
        this.ctx.keystore.session.qrString = qrCodeInfo.qrSig;
        this.ctx.keystore.session.qrUrl = qrCodeInfo.url;
        onQrCode(qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            const qrCodeResultLoop = setInterval(async () => {
                const res = await this.ctx.ops.call('queryQrCodeResult');
                this.log.emit('debug', 'Bot', `Query QR code result: ${res.confirmed ? 'confirmed' : res.state}`);
                if (res.confirmed) {
                    clearInterval(qrCodeResultLoop);
                    this.ctx.keystore.session.tempPassword = res.tempPassword;
                    this.ctx.keystore.session.noPicSig = res.noPicSig;
                    this.ctx.keystore.stub.tgtgtKey = res.tgtgtKey;
                    resolve();
                } else {
                    if (res.state === TransEmp12_QrCodeState.CodeExpired || res.state === TransEmp12_QrCodeState.Canceled) {
                        clearInterval(qrCodeResultLoop);
                        reject(new Error('Session expired or cancelled'));
                    }
                }
            }, queryQrCodeResultInterval);
        });

        this.ctx.keystore.uin = await this.ctx.wtLoginLogic.getCorrectUin();
        this.log.emit('info', 'Bot', `User ${this.uin} scanned QR code`);

        const loginResult = await this.ctx.ops.call('wtLogin');
        if (!loginResult.success) {
            throw new Error(`Login failed (state=${loginResult.state} tag=${loginResult.tag} message=${loginResult.message})`);
        }

        this.ctx.keystore.uid = loginResult.uid;

        this.ctx.keystore.session.d2Key = loginResult.session.d2Key;
        this.ctx.keystore.session.tgt = loginResult.session.tgt;
        this.ctx.keystore.session.d2 = loginResult.session.d2;
        this.ctx.keystore.session.tempPassword = loginResult.session.tempPassword;
        this.ctx.keystore.session.sessionDate = loginResult.session.sessionDate;

        this.ctx.keystore.info = loginResult.info;

        this.log.emit('debug', 'Bot', `Keystore: ${JSON.stringify(this.ctx.keystore)}`);
        this.log.emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);
        this.log.emit('info', 'Bot',
            `Name: ${this.ctx.keystore.info.name}; Gender: ${this.ctx.keystore.info.gender}; Age: ${this.ctx.keystore.info.age}`);

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
        const keyExchangeResult = await this.ctx.ops.call('keyExchange');
        this.ctx.keystore.session.exchangeKey = keyExchangeResult.gcmKey;
        this.ctx.keystore.session.keySign = keyExchangeResult.sign;
    }

    /**
     * Perform easy login using exchanged key.
     * Do not confuse this with `fastLogin`, which tries to get online using existing session first.
     * You should always rely on `fastLogin` unless you know what you are doing.
     */
    async ntEasyLogin() {
        const easyLoginResult = await this.ctx.ops.call('ntEasyLogin');
        if (!easyLoginResult.success) {
            throw new Error(`Login failed (${easyLoginResult.errorCode})`);
            // TODO: handle unusual cases
        }

        this.ctx.keystore.session.d2Key = easyLoginResult.d2Key;
        this.ctx.keystore.session.tgt = easyLoginResult.tgt;
        this.ctx.keystore.session.d2 = easyLoginResult.d2;
        this.ctx.keystore.session.tempPassword = easyLoginResult.tempPassword;
        this.ctx.keystore.session.sessionDate = easyLoginResult.sessionDate;
        
        this.log.emit('debug', 'Bot', `Keystore: ${JSON.stringify(this.ctx.keystore)}`);
        this.log.emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);

        await this.botOnline();
    }

    /**
     * Get online using existing session
     */
    async botOnline() {
        const onlineResult = await this.ctx.ops.call('botOnline');
        if (!(onlineResult?.includes('register success'))) {
            throw new Error(`Failed to go online (${onlineResult})`);
        }

        this.loggedIn = true;
        this.log.emit('info', 'Bot', `User ${this.uin} is now online`);

        this.heartbeatIntervalRef = setInterval(() => {
            this.ctx.ops.call('heartbeat');
            this.log.emit('debug', 'Bot', 'Heartbeat sent');
        }, 4.5 * 60 * 1000 /* 4.5 minute */);
    }

    /**
     * Get all friends
     * @param forceUpdate Whether to force update the friend list
     */
    async getFriends(forceUpdate = false) {
        this.log.emit('debug', 'Bot', 'Getting friends');
        return this.friendCache.getAll(forceUpdate);
    }

    /**
     * Get a friend by Uin
     * @param uin Uin of the friend
     * @param forceUpdate Whether to force update the friend info
     */
    async getFriend(uin: number, forceUpdate = false) {
        this.log.emit('debug', 'Bot', `Getting friend ${uin}`);
        return this.friendCache.get(uin, forceUpdate);
    }

    /**
     * Get all groups
     * @param forceUpdate Whether to force update the group list
     */
    async getGroups(forceUpdate = false) {
        this.log.emit('debug', 'Bot', 'Getting groups');
        return this.groupCache.getAll(forceUpdate);
    }

    /**
     * Get a group by Uin
     * @param uin Uin of the group
     * @param forceUpdate Whether to force update the group info
     */
    async getGroup(uin: number, forceUpdate = false) {
        this.log.emit('debug', 'Bot', `Getting group ${uin}`);
        return this.groupCache.get(uin, forceUpdate);
    }

    /**
     * Listen to debug logs
     */
    onDebug(listener: (module: string, message: string) => void) {
        this.log.on('debug', listener);
    }

    /**
     * Listen to info logs
     */
    onInfo(listener: (module: string, message: string) => void) {
        this.log.on('info', listener);
    }

    /**
     * Listen to warning logs
     */
    onWarning(listener: (module: string, message: string, error?: unknown) => void) {
        this.log.on('warning', listener);
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
        await bot.ctx.ssoLogic.connectToMsfServer();
        await bot.ctx.ops.call('fetchHighwayUrl')
            .then(data => {
                const { ip, port } = data.serverInfo[0];
                bot.ctx.highwayLogic.setHighwayUrl(ip, port, data.sigSession);
            });
        return bot;
    }
}

export * from './entity';
export * from './message';
export * from './util';