import { z } from 'zod';

const zServerLikeConfig = z.object({
    host: z.string().ip(),
    port: z.number().int().positive().max(65535),
    accessToken: z.string().optional(),
});

const zClientLikeConfig = z.object({
    url: z.string().url(),
    accessToken: z.string().optional(),
});

const zHeartbeatLikeConfig = z.union([
    z.object({
        enableHeartbeat: z.literal(true),
        heartbeatInterval: z.number().int().positive(),
    }),
    z.object({
        enableHeartbeat: z.literal(false),
        heartbeatInterval: z.number().optional(),
    }),
]);

export const zHttpServerAdapterConfig = z.object({
    type: z.literal('httpServer'),
}).and(zServerLikeConfig);

export const zHttpClientAdapterConfig = z.object({
    type: z.literal('httpClient'),
    signatureSecret: z.string().optional(),
}).and(zClientLikeConfig).and(zHeartbeatLikeConfig);

export const zWebSocketServerAdapterConfig = z.object({
    type: z.literal('webSocketServer'),
}).and(zServerLikeConfig).and(zHeartbeatLikeConfig);

export const zWebSocketClientAdapterConfig = z.object({
    type: z.literal('webSocketClient'),
    reconnectInterval: z.number().int().positive(),
}).and(zClientLikeConfig).and(zHeartbeatLikeConfig);

export const zConfig = z.object({
    logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
    signApiUrl: z.string().url()
        .transform((url) => (url.endsWith('/') ? url.substring(0, url.length - 1) : url)),
    botUin: z.number().int(),
    reportSelfMessage: z.boolean(),
    messageReportType: z.enum(['array', 'string']),
    adapters: z.array(z.union([
        zHttpServerAdapterConfig,
        zHttpClientAdapterConfig,
        zWebSocketServerAdapterConfig,
        zWebSocketClientAdapterConfig,
    ])),
});

export type Config = z.infer<typeof zConfig>;
export type HttpServerAdapterConfig = z.infer<typeof zHttpServerAdapterConfig>;
export type HttpClientAdapterConfig = z.infer<typeof zHttpClientAdapterConfig>;
export type WebSocketServerAdapterConfig = z.infer<typeof zWebSocketServerAdapterConfig>;
export type WebSocketClientAdapterConfig = z.infer<typeof zWebSocketClientAdapterConfig>;