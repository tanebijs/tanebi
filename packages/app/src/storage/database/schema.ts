import * as d from 'drizzle-orm/sqlite-core';

export const message = d.sqliteTable('message', {
    id: d.integer().primaryKey({ autoIncrement: true }),
    createdAt: d.integer().notNull(),
    storeType: d.integer().notNull(), // 0 = PushMsgBody, 1 = OutgoingMessageStore
    type: d.integer().notNull(), // 1 = private, 2 = group
    peerUin: d.integer().notNull(),
    sequence: d.integer().notNull(),
    clientSequence: d.integer(),
    isCompressed: d.integer({ mode: 'boolean' }),
    body: d.blob({ mode: 'buffer' }).notNull(),
}, (t) => [
    d.unique().on(t.type, t.peerUin, t.sequence),
]);
