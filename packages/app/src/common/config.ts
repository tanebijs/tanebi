import { z } from 'zod';

const zDatabaseStorageConfig = z.object({
    location: z.literal('database'),
    compressMessage: z.boolean().default(true),
});

const zMemoryStorageConfig = z.object({
    location: z.literal('memory'),
    maxCount: z.number().int().positive().default(1000),
    maxLifetime: z.number().int().positive().default(3600),
});

export const zHttpServerAdapterConfig = z.object({
    type: z.literal('httpServer'),
    host: z.string().ip(),
    port: z.number().int().positive().max(65535),
    accessToken: z.string().optional(),
});

export const zHttpClientAdapterConfig = z.object({
    type: z.literal('httpClient'),
    url: z.string().url(),
    enableHeartbeat: z.boolean(),
    heartbeatInterval: z.number().int().positive().min(1000).optional(),
    signatureSecret: z.string().optional(),
});

export const zWebSocketServerAdapterConfig = z.object({
    type: z.literal('webSocketServer'),
    host: z.string().ip(),
    port: z.number().int().positive().max(65535),
    accessToken: z.string().optional(),
    enableHeartbeat: z.boolean(),
    heartbeatInterval: z.number().int().positive().min(1000).optional(),
});

export const zWebSocketClientAdapterConfig = z.object({
    type: z.literal('webSocketClient'),
    url: z.string().url(),
    enableHeartbeat: z.boolean(),
    heartbeatInterval: z.number().int().positive().min(1000).optional(),
    reconnectInterval: z.number().int().positive().min(1000).default(5000),
});

export const zConfig = z.object({
    logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
    signApiUrl: z.string().url()
        .transform((url) => (url.endsWith('/') ? url.substring(0, url.length - 1) : url)),
    reportSelfMessage: z.boolean(),
    messageReportType: z.enum(['array', 'string']),
    enableNtSilk: z.boolean(),
    onForcedOffline: z.enum(['exit', 'reLogin', 'noAction']).default('noAction'),
    storage: z.union([
        zDatabaseStorageConfig,
        zMemoryStorageConfig,
    ]),
    adapters: z.array(z.discriminatedUnion('type', [
        zHttpServerAdapterConfig,
        zHttpClientAdapterConfig,
        zWebSocketServerAdapterConfig,
        zWebSocketClientAdapterConfig,
    ])),
});

export type Config = z.infer<typeof zConfig>;

export type DatabaseStorageConfig = z.infer<typeof zDatabaseStorageConfig>;
export type MemoryStorageConfig = z.infer<typeof zMemoryStorageConfig>;

export type HttpServerAdapterConfig = z.infer<typeof zHttpServerAdapterConfig>;
export type HttpClientAdapterConfig = z.infer<typeof zHttpClientAdapterConfig>;
export type WebSocketServerAdapterConfig = z.infer<typeof zWebSocketServerAdapterConfig>;
export type WebSocketClientAdapterConfig = z.infer<typeof zWebSocketClientAdapterConfig>;

export const exampleConfig: Config = {
    logLevel: 'info',
    signApiUrl: 'https://sign.lagrangecore.org/api/sign/30366',
    reportSelfMessage: false,
    messageReportType: 'array',
    enableNtSilk: false,
    onForcedOffline: 'noAction',
    storage: {
        location: 'database',
        compressMessage: true,
    },
    adapters: [
        {
            type: 'httpServer',
            host: '0.0.0.0',
            port: 3100,
        },
    ],
};