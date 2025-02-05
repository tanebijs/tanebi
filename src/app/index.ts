import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/core';
import { TransEmp12_QrCodeState } from '@/core/packet/login/wtlogin/TransEmp12';

/**
 * The Bot object. Create an instance by calling `Bot.create` instead of its constructor.
 */
export class Bot {
    readonly ctx;

    public get uin() {
        return this.ctx.keystore.uin === 0 ? undefined : this.ctx.keystore.uin;
    }

    loggedIn = false;

    private constructor(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        this.ctx = new BotContext(appInfo, coreConfig, deviceInfo, keystore, signProvider);
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
        this.ctx.keystore.session.qrSign = qrCodeInfo.signature;
        this.ctx.keystore.session.qrString = qrCodeInfo.qrSig;
        this.ctx.keystore.session.qrUrl = qrCodeInfo.url;
        onQrCode(qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise((resolve, reject) => {
            const qrCodeResultLoop = setInterval(async () => {
                const res = await this.ctx.ops.call('queryQrCodeResult');
                if (res.confirmed) {
                    clearInterval(qrCodeResultLoop);
                    this.ctx.keystore.session.tempPassword = res.tempPassword;
                    this.ctx.keystore.session.noPicSig = res.noPicSig;
                    this.ctx.keystore.stub.tgtgtKey = res.tgtgtKey;
                } else {
                    if (res.state === TransEmp12_QrCodeState.CodeExpired || res.state === TransEmp12_QrCodeState.Canceled) {
                        clearInterval(qrCodeResultLoop);
                        reject(new Error('Session expired or cancelled'));
                    }
                }
            }, queryQrCodeResultInterval);
        });

        this.ctx.keystore.uin = await this.ctx.wtLoginLogic.getCorrectUin();

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
    }

    /**
     * Create a new Bot instance and connect it to Tencent's MSF server
     */
    static async create(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        const bot = new Bot(appInfo, coreConfig, deviceInfo, keystore, signProvider);
        await bot.ctx.networkLogic.connectToMsfServer();
        return bot;
    }
}