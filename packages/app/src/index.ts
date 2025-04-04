#!/usr/bin/env node

import {
    blob,
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    DeviceInfo,
    fetchAppInfoFromSignUrl,
    GroupMemberPermission,
    Keystore, MessageType,
    newDeviceInfo,
    newKeystore,
    rawMessage,
    serializeDeviceInfo,
    serializeKeystore,
    UrlSignProvider,
} from 'tanebi';
import { generate, QRErrorCorrectLevel } from 'ts-qrcode-terminal';
import fs from 'node:fs';
import path from 'node:path';
import { Config, exampleConfig, zConfig } from '@app/common/config';
import { ActionCollection } from '@app/action';
import { OneBotNetworkAdapter } from '@app/network';
import { OneBotHttpServerAdapter } from '@app/network/http-server';
import winston, { format, transports } from 'winston';
import chalk from 'chalk';
import { MessageStoreType } from '@app/storage/types';
import { AbstractStorage } from '@app/storage';
import { DatabaseStorage } from '@app/storage/database';
import { MemoryStorage } from '@app/storage/memory';
import { NTSilkBinding } from '@app/common/silk';
import { send_msg } from '@app/action/message/send_msg';
import { send_group_msg } from '@app/action/message/send_group_msg';
import { send_private_msg } from '@app/action/message/send_private_msg';
import { send_poke } from '@app/action/message/send_poke';
import { delete_msg } from '@app/action/message/delete_msg';
import { OneBotGroupMessageEvent, OneBotPrivateMessageEvent } from '@app/event/message';
import { transformRecvMessage } from '@app/message/transform/recv';

export class OneBotApp {
    readonly projectDir = path.resolve(import.meta.dirname, '..');
    readonly logger: winston.Logger;
    readonly storage: AbstractStorage<unknown>;
    readonly actions = new ActionCollection(this, [
        delete_msg,
        send_group_msg,
        send_msg,
        send_poke,
        send_private_msg,
    ]);
    readonly adapters: OneBotNetworkAdapter<unknown>[];

    private constructor(
        readonly userDataDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly ntSilkBinding: NTSilkBinding | null,
        readonly config: Config
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
                                `${timestamp} [${level}] [${meta.module ?? 'Bot'}] ${message}`
                        ),
                        format.uncolorize()
                    ),
                }),
                new transports.Console({
                    level: config.logLevel === 'trace' ? 'debug' : config.logLevel,
                    format: format.combine(
                        format.timestamp({ format: 'hh:mm:ss' }),
                        format.colorize(),
                        format.printf(
                            ({ timestamp, level, message, ...meta }) =>
                                `${timestamp} ${level} ${chalk.magentaBright(meta.module ?? 'Bot')} ${message}`
                        )
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

        this.installMessageHandler();
        this.installLogger();

        this.adapters = config.adapters.map((adapterConfig, index) => {
            if (adapterConfig.type === 'httpServer') {
                return new OneBotHttpServerAdapter(this, adapterConfig, '' + index);
            }
            throw new Error(`Unsupported adapter type: ${adapterConfig.type}`);
        });
    }

    installMessageHandler() {
        this.bot.onPrivateMessage(async (friend, message) => {
            if (message.isSelf && !this.config.reportSelfMessage) {
                return;
            }
            try {
                const id = await this.storage.insert({
                    createdAt: Math.round(Date.now() / 1000),
                    storeType: MessageStoreType.PushMsgBody,
                    type: MessageType.PrivateMessage,
                    peerUin: friend.uin,
                    sequence: message.sequence,
                    clientSequence: message[rawMessage].clientSequence,
                    body: Buffer.from(message[rawMessage][blob]),
                });
                await Promise.all(
                    this.adapters.map((adapter) => adapter.emitEvent(new OneBotPrivateMessageEvent(
                        this,
                        id,
                        friend.uin,
                        message.content.toPreviewString(),
                        12, // TODO: Get font info
                        transformRecvMessage(message),
                        'friend',
                        {
                            user_id: friend.uin,
                            nickname: message[rawMessage].senderName,
                            sex: '', // TODO: Get gender from friend indo
                            age: 0, // TODO: Get age from friend info
                        }
                    )))
                );
            } catch (e) {
                this.logger.error(`Failed to process message: ${e}`);
            }
        });

        this.bot.onGroupMessage(async (group, sender, message) => {
            if (sender.uin === this.bot.uin && !this.config.reportSelfMessage) {
                return;
            }
            try {
                const id = await this.storage.insert({
                    createdAt: Math.round(Date.now() / 1000),
                    storeType: MessageStoreType.PushMsgBody,
                    type: MessageType.GroupMessage,
                    peerUin: group.uin,
                    sequence: message.sequence,
                    clientSequence: null,
                    body: Buffer.from(message[rawMessage][blob]),
                });
                await Promise.all(
                    this.adapters.map((adapter) => adapter.emitEvent(new OneBotGroupMessageEvent(
                        this,
                        id,
                        sender.uin,
                        message.content.toPreviewString(),
                        12, // TODO: Get font info
                        transformRecvMessage(message),
                        'normal',
                        group.uin,
                        {
                            user_id: sender.uin,
                            nickname: message[rawMessage].senderName,
                            card: sender.card ?? '',
                            area: '', // TODO: Get area from member info
                            level: '', // TODO: Get level from member info
                            role: sender.permission === GroupMemberPermission.Owner ? 'owner' :
                                sender.permission === GroupMemberPermission.Admin ? 'admin' : 'member',
                            title: sender.specialTitle ?? '',
                            sex: '', // TODO: Get gender from member indo
                            age: 0, // TODO: Get age from member info
                        },
                    )))
                );
            } catch (e) {
                this.logger.error(`Failed to process message: ${e}`);
            }
        });
    }

    installLogger() {
        this.bot.onPrivateMessage((friend, message) =>
            this.logger.info(`${message.isSelf ? '->' : '<-'} [${chalk.yellow(friend)}] ${message.content.toPreviewString()}`, {
                module: 'Message',
            })
        );

        this.bot.onGroupMessage((group, sender, message) =>
            this.logger.info(
                `${
                    sender.uin === this.bot.uin ? '->' : '<-'
                } [${chalk.blueBright(group)}] [${chalk.green(sender)}] ${message.content.toPreviewString()}`,
                { module: 'Message' }
            )
        );

        this.bot.onFriendPoke((friend, isSelf, actionStr, _, suffix) =>
            this.logger.info(
                isSelf
                    ? `你${actionStr || '戳了戳'} ${friend} ${suffix}`
                    : `${friend} ${actionStr || '戳了戳'}你${suffix}`,
                { module: 'FriendPoke' }
            )
        );

        this.bot.onFriendRecall((friend, seq, tip) =>
            this.logger.info(`${friend} [${seq}] ${tip}`, {
                module: 'FriendRecall',
            })
        );

        this.bot.onFriendRequest((req) => this.logger.info(req.toString(), { module: 'FriendRequest' }));

        this.bot.onGroupAdminChange((group, member, isPromote) =>
            this.logger.info(`[${group}] ${member} ${isPromote ? 'promoted to' : 'demoted from'} admin`, {
                module: 'GroupAdminChange',
            })
        );

        this.bot.onGroupEssenceMessageChange((group, sequence, operator, isAdd) => {
            this.logger.info(
                `[${group}] (sequence=${sequence} ${isAdd ? 'added to' : 'removed from'} essence) by ${operator}`,
                { module: 'GroupEssenceMessageChange' }
            );
        });

        this.bot.onGroupInvitationRequest((req) =>
            this.logger.info(req.toString(), { module: 'GroupInvitationRequest' })
        );

        this.bot.onGroupInvitedJoinRequest((_, req) =>
            this.logger.info(req.toString(), { module: 'GroupInvitedJoinRequest' })
        );

        this.bot.onGroupJoinRequest((_, req) => this.logger.info(req.toString(), { module: 'GroupJoinRequest' }));

        this.bot.onGroupMemberIncrease((group, member, operator) =>
            this.logger.info(
                `[${group}] ${member} joined` +
                    (operator ? ` by ${operator.card || operator.nickname} (${operator.uin})` : ''),
                { module: 'GroupMemberIncrease' }
            )
        );

        this.bot.onGroupMemberLeave((group, memberUin) =>
            this.logger.info(`[${group}] (${memberUin}) left`, { module: 'GroupMemberLeave' })
        );

        this.bot.onGroupMemberKick((group, memberUin, operator) =>
            this.logger.info(`[${group}] (${memberUin}) was kicked by ${operator}`, { module: 'GroupMemberKick' })
        );

        this.bot.onGroupMute((group, member, operator, duration) =>
            this.logger.info(`[${group}] ${member} was muted by ${operator} for ${duration} seconds`, {
                module: 'GroupMute',
            })
        );

        this.bot.onGroupUnmute((group, member, operator) =>
            this.logger.info(`[${group}] ${member} was unmuted by ${operator}`, { module: 'GroupUnmute' })
        );

        this.bot.onGroupMuteAll((group, operator, isSet) =>
            this.logger.info(`${group} ${isSet ? 'muted' : 'unmuted'} by ${operator}`, { module: 'GroupMuteAll' })
        );

        this.bot.onGroupReaction((group, seq, operator, code, isAdd) =>
            this.logger.info(`[${group}] ${operator} ${isAdd ? 'added' : 'removed'} reaction ${code} to msg [${seq}]`, {
                module: 'GroupReaction',
            })
        );

        this.bot.onGroupRecall((group, seq, tip, operator) =>
            this.logger.info(`[${group}] [${seq}] ${operator} ${tip}`, { module: 'GroupRecall' })
        );

        this.bot.onGroupPoke((group, sender, receiver, actionStr, _, suffix) =>
            this.logger.info(
                `[${group}] ${sender} ${actionStr || '戳了戳'} ${receiver} ${suffix}`,
                { module: 'GroupPoke' }
            )
        );
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

    static async create(baseDir: string) {
        let bot: Bot;

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        const configPath = path.join(baseDir, 'config.json');

        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 4));
            console.info(`Example config file created at ${configPath}.`);
            console.info('Please edit the config file and press any key to continue.');
            await new Promise((resolve) => process.stdin.once('data', resolve));
        }

        const config = zConfig.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
        const userDataDir = path.join(baseDir, '' + config.botUin);
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        //#region Bot Initialization
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
        //#endregion

        //#region NTSilk Initialization
        const ntSilkPath = path.join(userDataDir, 'ntsilk');
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
        //#endregion

        return new OneBotApp(
            userDataDir,
            isFirstRun,
            bot,
            ntSilkBinding,
            config
        );
    }
}

async function main() {
    const app = await OneBotApp.create('data');
    await app.start();
}

main();