#!/usr/bin/env node

import { ActionCollection } from '@app/action';
import { can_send_image } from '@app/action/ability/can_send_image';
import { can_send_record } from '@app/action/ability/can_send_record';
import { get_friend_list } from '@app/action/friend/get_friend_list';
import { get_stranger_info } from '@app/action/friend/get_stranger_info';
import { send_like } from '@app/action/friend/send_like';
import { set_friend_add_request } from '@app/action/friend/set_friend_add_request';
import { get_group_info } from '@app/action/group/get_group_info';
import { get_group_list } from '@app/action/group/get_group_list';
import { get_group_member_info } from '@app/action/group/get_group_member_info';
import { get_group_member_list } from '@app/action/group/get_group_member_list';
import { set_group_add_request } from '@app/action/group/set_group_add_request';
import { set_group_admin } from '@app/action/group/set_group_admin';
import { set_group_ban } from '@app/action/group/set_group_ban';
import { set_group_card } from '@app/action/group/set_group_card';
import { set_group_kick } from '@app/action/group/set_group_kick';
import { set_group_leave } from '@app/action/group/set_group_leave';
import { set_group_name } from '@app/action/group/set_group_name';
import { set_group_special_title } from '@app/action/group/set_group_special_title';
import { set_group_whole_ban } from '@app/action/group/set_group_whole_ban';
import { delete_msg } from '@app/action/message/delete_msg';
import { get_forward_msg } from '@app/action/message/get_forward_msg';
import { get_msg } from '@app/action/message/get_msg';
import { get_msg_count } from '@app/action/message/get_msg_count';
import { send_forward_msg } from '@app/action/message/send_forward_msg';
import { send_group_forward_msg } from '@app/action/message/send_group_forward_msg';
import { send_group_msg } from '@app/action/message/send_group_msg';
import { send_msg } from '@app/action/message/send_msg';
import { send_poke } from '@app/action/message/send_poke';
import { send_private_forward_msg } from '@app/action/message/send_private_forward_msg';
import { send_private_msg } from '@app/action/message/send_private_msg';
import { get_login_info } from '@app/action/system/get_login_info';
import { get_status } from '@app/action/system/get_status';
import { get_version_info } from '@app/action/system/get_version_info';
import { Config, exampleConfig, zConfig } from '@app/common/config';
import { installLogger } from '@app/common/log';
import { defaultProfile, zProfile } from '@app/common/profile';
import { NTSilkBinding } from '@app/common/silk';
import { OneBotEvent } from '@app/event';
import { installNoticeEventHandler } from '@app/event/notice';
import { installRequestEventHandler } from '@app/event/request';
import { installMessageHandler } from '@app/message/dispatch';
import { OneBotNetworkAdapter } from '@app/network';
import { OneBotHttpClientAdapter } from '@app/network/http-client';
import { OneBotHttpServerAdapter } from '@app/network/http-server';
import { OneBotWebSocketClientAdapter } from '@app/network/ws-client';
import { OneBotWebSocketServerAdapter } from '@app/network/ws-server';
import { AbstractStorage } from '@app/storage';
import { DatabaseStorage } from '@app/storage/database';
import { MemoryStorage } from '@app/storage/memory';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import {
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    DeviceInfo,
    fetchAppInfoFromSignUrl,
    Keystore,
    newDeviceInfo,
    newKeystore,
    serializeDeviceInfo,
    serializeKeystore,
    UrlSignProvider,
} from 'tanebi';
import { generate, QRErrorCorrectLevel } from 'ts-qrcode-terminal';
import winston, { format, transports } from 'winston';

export class OneBotApp {
    readonly projectDir = path.resolve(import.meta.dirname, '..');
    readonly logger: winston.Logger;
    readonly storage: AbstractStorage<unknown>;
    readonly actions = new ActionCollection(this, [
        can_send_image,
        can_send_record,

        get_friend_list,
        get_stranger_info,
        send_like,
        set_friend_add_request,

        get_group_list,
        get_group_info,
        get_group_member_list,
        get_group_member_info,
        set_group_add_request,
        set_group_admin,
        set_group_card,
        set_group_ban,
        set_group_kick,
        set_group_leave,
        set_group_name,
        set_group_special_title,
        set_group_whole_ban,

        delete_msg,
        get_forward_msg,
        get_msg,
        get_msg_count,
        send_forward_msg,
        send_group_forward_msg,
        send_group_msg,
        send_msg,
        send_poke,
        send_private_forward_msg,
        send_private_msg,

        get_login_info,
        get_status,
        get_version_info,
    ]);
    readonly adapters: OneBotNetworkAdapter<unknown>[];

    private constructor(
        readonly userDataDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly ntSilkBinding: NTSilkBinding | null,
        readonly config: Config,
    ) {
        const logDir = path.join(userDataDir, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
        this.logger = winston.createLogger({
            transports: [
                new transports.File({
                    filename: path.join(logDir, `${new Date().toISOString().replaceAll(':', '')}.log`),
                    level: 'debug',
                    maxsize: 5 * 1024 * 1024, // 5MB
                    maxFiles: 5,
                    format: format.combine(
                        format.timestamp(),
                        format.printf(
                            ({ timestamp, level, message, ...meta }) =>
                                `${timestamp} [${level}] [${meta.module ?? 'Bot'}] ${message}`,
                        ),
                        format.uncolorize(),
                    ),
                }),
                new transports.Console({
                    level: config.logLevel === 'trace' ? 'debug' : config.logLevel,
                    format: format.combine(
                        format.timestamp({ format: 'hh:mm:ss' }),
                        format.colorize(),
                        format.printf(
                            ({ timestamp, level, message, ...meta }) =>
                                `${timestamp} ${level} ${chalk.magentaBright(meta.module ?? 'Bot')} ${message}`,
                        ),
                    ),
                }),
            ],
        });

        if (config.logLevel === 'trace') {
            this.bot.onTrace((module, message) => this.logger.debug(`${message}`, { module }));
        }
        this.bot.onInfo((module, message) => this.logger.info(`${message}`, { module }));
        this.bot.onWarning((module, message, error) =>
            this.logger.warn(`${message} caused by ${error instanceof Error ? error.stack : error}`, { module })
        );
        this.bot.onFatal((module, message, error) =>
            this.logger.error(`${message} caused by ${error instanceof Error ? error.stack : error}`, { module })
        );

        if (this.config.storage.location === 'database') {
            this.storage = new DatabaseStorage(this, this.config.storage);
        } else {
            this.storage = new MemoryStorage(this, this.config.storage);
        }

        installLogger(this);
        installMessageHandler(this);
        installNoticeEventHandler(this);
        installRequestEventHandler(this);

        if (this.config.onForcedOffline === 'exit') {
            this.bot.onForceOffline(() => {
                this.dispose().then(() => {
                    this.logger.error('Bot is forced offline, exiting...');
                    process.exit(1);
                });
            });
        } else if (this.config.onForcedOffline === 'reLogin') {
            this.bot.onForceOffline(() => {
                this.logger.warn('Bot is forced offline, re-login...');
                this.bot.fastLogin();
            });
        }

        this.adapters = config.adapters.map((adapterConfig, index) => {
            if (adapterConfig.type === 'httpServer') {
                return new OneBotHttpServerAdapter(this, adapterConfig, '' + index);
            } else if (adapterConfig.type === 'httpClient') {
                return new OneBotHttpClientAdapter(this, adapterConfig, '' + index);
            } else if (adapterConfig.type === 'webSocketServer') {
                return new OneBotWebSocketServerAdapter(this, adapterConfig, '' + index);
            } else { // if (adapterConfig.type === 'webSocketClient')
                return new OneBotWebSocketClientAdapter(this, adapterConfig, '' + index);
            }
        });
    }

    async dispatchEvent(event: OneBotEvent) {
        const dispatchResult = await Promise.allSettled(this.adapters.map((adapter) => adapter.emitEvent(event)));
        const errorIndexes: number[] = [];
        dispatchResult.forEach((value, index) => {
            if (value.status === 'rejected') {
                errorIndexes.push(index);
            }
        });
        if (errorIndexes.length > 0) {
            this.logger.error(
                `Failed to dispatch event to ${errorIndexes.length} adapter(s): ${errorIndexes.join(', ')}`,
            );
        }
    }

    async start() {
        await this.storage.init();
        await Promise.all(this.adapters.map((adapter) => adapter.start()));
        if (this.isFirstRun) {
            const qrCodePath = path.join(this.userDataDir, 'qrCode.png');
            await this.bot.qrCodeLogin((url, png) => {
                fs.writeFileSync(qrCodePath, png);
                this.logger.info('Please scan the QR code below to login:');
                generate(url, { small: true, qrErrorCorrectLevel: QRErrorCorrectLevel.L });
                this.logger.info(`QR code image saved to ${path.resolve(qrCodePath)}.`);
                this.logger.info('Or you can generate a QR code with the following URL:');
                this.logger.info(url);
            });
        } else {
            await this.bot.fastLogin();
        }
    }

    async dispose() {
        await Promise.all(this.adapters.map((adapter) => adapter.stop()));
        await this.bot.dispose();
    }

    static async create(baseDir: string) {
        let bot: Bot;

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        const profilePath = path.join(baseDir, 'profile.json');
        if (!fs.existsSync(profilePath)) {
            fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 4));
        }
        const profile = zProfile.parse(JSON.parse(fs.readFileSync(profilePath, 'utf-8')));

        const userDataDir = path.join(baseDir, profile.name);
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        const configPath = path.join(userDataDir, 'config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 4));
            console.info(`Example config file created at ${configPath}.`);
            console.info('Please edit the config file and press any key to continue.');
            await new Promise((resolve) => process.stdin.once('data', resolve));
        }
        const config = zConfig.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        // #region Bot Initialization
        const deviceInfoPath = path.join(userDataDir, 'deviceInfo.json');
        const keystorePath = path.join(userDataDir, 'keystore.json');

        const appInfo = await fetchAppInfoFromSignUrl(config.signApiUrl);
        const signProvider = UrlSignProvider(config.signApiUrl);

        let deviceInfo: DeviceInfo;
        if (!fs.existsSync(deviceInfoPath)) {
            deviceInfo = newDeviceInfo();
            fs.writeFileSync(deviceInfoPath, JSON.stringify(serializeDeviceInfo(deviceInfo)));
        } else {
            deviceInfo = deserializeDeviceInfo(JSON.parse(fs.readFileSync(deviceInfoPath, 'utf-8')));
        }

        let keystore: Keystore;
        let isFirstRun = false;
        if (!fs.existsSync(keystorePath)) {
            keystore = newKeystore();
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
            isFirstRun = true;
        } else {
            keystore = deserializeKeystore(JSON.parse(fs.readFileSync(keystorePath, 'utf-8')));
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
        }

        bot.onKeystoreChange((keystore) => {
            fs.writeFileSync(keystorePath, JSON.stringify(serializeKeystore(keystore)));
        });
        // #endregion

        // #region NTSilk Initialization
        const ntSilkPath = path.join(baseDir, '__ntsilk');
        if (!fs.existsSync(ntSilkPath)) {
            fs.mkdirSync(ntSilkPath);
        }
        let ntSilkBinding: NTSilkBinding | null = null;
        if (config.enableNtSilk) {
            try {
                ntSilkBinding = await NTSilkBinding.create(ntSilkPath);
            } catch (e) {
                console.warn('Failed to create NTSilk binding:', e);
            }
        }
        // #endregion

        return new OneBotApp(
            userDataDir,
            isFirstRun,
            bot,
            ntSilkBinding,
            config,
        );
    }
}

async function main() {
    const app = await OneBotApp.create('data');
    await app.start();

    let sigIntTriggered = false;
    process.on('SIGINT', () => {
        if (sigIntTriggered) {
            return;
        }
        sigIntTriggered = true;
        app.dispose().then(() => {
            process.exit(0);
        });
    });
}

main();
