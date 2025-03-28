import * as d from 'drizzle-orm/sqlite-core';

export const message = d.sqliteTable('message', {
    id:             d.integer().primaryKey({ autoIncrement: true }),
    createdAt:      d.integer().notNull(),
    direction:      d.integer().notNull(), // 0 = incoming, 1 = outgoing
    type:           d.integer().notNull(), // 1 = private, 2 = group
    peerUin:        d.integer().notNull(),
    sequence:       d.integer().notNull(),
    clientSequence: d.integer(),
    body:           d.text({ mode: 'json' }), // Incoming: IncomingMessage, Outgoing: OneBotSendSegment[]
}, (t) => [
    d.unique().on(t.type, t.peerUin, t.sequence),
]);
