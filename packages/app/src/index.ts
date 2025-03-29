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
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import fs from 'node:fs';
import path from 'node:path';
import { Config, exampleConfig, zConfig } from '@/common/config';
import { ActionCollection } from '@/action';
import { OneBotNetworkAdapter } from '@/network';
import { OneBotHttpServerAdapter } from '@/network/http-server';
import winston, { format, transports } from 'winston';
import chalk from 'chalk';

export class OneBotApp {
    readonly logger;
    readonly actions = new ActionCollection(this, []);
    readonly adapters: OneBotNetworkAdapter<unknown>[];

    private constructor(
        readonly userDataDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly db: ReturnType<typeof drizzle>,
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
                    level: config.logLevel,
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

        this.bot.onDebug((module, message) => this.logger.debug(`${message}`, { module }));
        this.bot.onInfo((module, message) => this.logger.info(`${message}`, { module }));
        this.bot.onWarning((module, message, error) =>
            this.logger.warn(`${message} caused by ${error instanceof Error ? error.stack : error}`, { module })
        );

        this.installLogger();

        this.adapters = config.adapters.map((adapterConfig, index) => {
            if (adapterConfig.type === 'httpServer') {
                return new OneBotHttpServerAdapter(this, adapterConfig, '' + index);
            }
            throw new Error(`Unsupported adapter type: ${adapterConfig.type}`);
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

        //#region Database Initialization
        const dbPath = path.join(userDataDir, 'data.db');
        const db = drizzle('file:' + dbPath);
        await migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, '..', 'drizzle') });
        //#endregion

        return new OneBotApp(userDataDir, isFirstRun, bot, db, config);
    }
}

async function main() {
    const app = await OneBotApp.create('data');
    await app.start();
}

main();
