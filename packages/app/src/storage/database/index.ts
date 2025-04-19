import { DatabaseStorageConfig } from '@app/common/config';
import { OneBotApp } from '@app/index';
import { AbstractStorage, MessageRowOrEmpty } from '@app/storage';
import { message } from '@app/storage/database/schema';
import { MessageRow } from '@app/storage/types';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'node:path';
import { promisify } from 'node:util';
import { deflate, inflate } from 'node:zlib';
import { MessageType } from 'tanebi';

export class DatabaseStorage extends AbstractStorage<DatabaseStorageConfig> {
    readonly db;

    constructor(app: OneBotApp, config: DatabaseStorageConfig) {
        super(app, config);
        const dbPath = path.join(app.userDataDir, 'data.db');
        this.db = drizzle('file:' + dbPath, { schema: { message } });
    }

    override async init(): Promise<void> {
        await migrate(this.db, { migrationsFolder: path.resolve(this.app.projectDir, 'drizzle') });
    }

    override async insert(row: Omit<MessageRow, 'id'>): Promise<number> {
        return (
            await this.db
                .insert(message)
                .values({
                    ...row,
                    isCompressed: this.config.compressMessage,
                    body: this.config.compressMessage ? await promisify(deflate)(row.body) : row.body,
                })
                .returning({ id: message.id })
        )[0].id;
    }

    override async getById(id: number): Promise<MessageRowOrEmpty> {
        return this.postProcessResult(await this.db.query.message.findFirst({ where: eq(message.id, id) }));
    }

    override async getByPeerAndSequence(
        type: MessageType,
        peerUin: number,
        sequence: number,
    ): Promise<MessageRowOrEmpty> {
        return this.postProcessResult(
            await this.db.query.message.findFirst({
                where: and(eq(message.type, type), eq(message.peerUin, peerUin), eq(message.sequence, sequence)),
            }),
        );
    }

    override async getPrivateByClientSequence(friendUin: number, clientSequence: number): Promise<MessageRowOrEmpty> {
        return this.postProcessResult(
            await this.db.query.message.findFirst({
                where: and(
                    eq(message.type, MessageType.PrivateMessage),
                    eq(message.peerUin, friendUin),
                    eq(message.clientSequence, clientSequence),
                ),
            }),
        );
    }

    private async postProcessResult(
        result?: MessageRow & { isCompressed: boolean | null; },
    ): Promise<MessageRowOrEmpty> {
        if (!result) {
            return undefined;
        }
        return {
            ...result,
            body: result.isCompressed ? await promisify(inflate)(result.body) : result.body,
        };
    }

    override async size(): Promise<number> {
        return await this.db.$count(message);
    }
}
