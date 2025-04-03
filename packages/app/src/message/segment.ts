import { ImageSubType } from 'tanebi';
import { zOneBotInputBoolean, zOneBotInputMessageId, zOneBotInputUin, zOneBotInputUrl } from '@app/common/types';
import { z } from 'zod';

export const zOneBotTextSegment = z.object({
    type: z.literal('text'),
    data: z.object({
        text: z.string(),
    }),
});

export const zOneBotFaceSegment = z.object({
    type: z.literal('face'),
    data: z.object({
        id: z.string(),
    }),
});

const zOneBotSendResourceGeneralData = z.object({
    cache: zOneBotInputBoolean.default(false),
    proxy: zOneBotInputBoolean.default(false),
    timeout: z.number().int().positive().optional(),
}).and(zOneBotInputUrl);

export const zOneBotSendRecordSegment = z.object({
    type: z.literal('record'),
    data: zOneBotSendResourceGeneralData,
});

const zOneBotAtData = z.object({
    qq: z.union([zOneBotInputUin, z.literal('all')]),
});

const zOneBotSendAtExtra = z.object({
    name: z.string().optional(),
});

export const zOneBotSendAtSegment = z.object({
    type: z.literal('at'),
    data: zOneBotAtData.and(zOneBotSendAtExtra),
});

const zOneBotImageExtra = z.object({
    summary: z.string().optional(),
    sub_type: z.nativeEnum(ImageSubType).default(ImageSubType.Picture),
});

export const zOneBotSendImageSegment = z.object({
    type: z.literal('image'),
    data: zOneBotSendResourceGeneralData.and(zOneBotImageExtra),
});

export const zOneBotReplySegment = z.object({
    type: z.literal('reply'),
    data: z.object({
        id: zOneBotInputMessageId,
    }),
});

export const zOneBotPokeSegment = z.object({
    type: z.literal('poke'),
    data: z.object({
        id: zOneBotInputUin,
    }),
});

const zOneBotNodeExistentMessageData = z.object({
    id: zOneBotInputMessageId,
});

const zOneBotNodeCustomMessageData = z.object({
    name: z.string(),
    user_id: zOneBotInputUin.optional(),
    uin: zOneBotInputUin.optional(), // for go-cqhttp compatibility
    content: z.any(),
});

export const zOneBotSendNodeSegment = z.object({
    type: z.literal('node'),
    data: z.union([zOneBotNodeExistentMessageData, zOneBotNodeCustomMessageData]),
});

type DefineRecvSegment<T extends string, D> = { type: T; data: D };
type RecvResourceGeneralData = { file: string; url: string };
type DefineRecvResourceSegment<T extends string, Extra = unknown> = DefineRecvSegment<
    T,
    RecvResourceGeneralData & Extra
>;

export type OneBotTextSegment = z.infer<typeof zOneBotTextSegment>;

export type OneBotFaceSegment = z.infer<typeof zOneBotFaceSegment>;

export type OneBotSendRecordSegment = z.infer<typeof zOneBotSendRecordSegment>;
export type OneBotRecvRecordSegment = DefineRecvResourceSegment<'record'>;

export type OneBotRecvVideoSegment = DefineRecvResourceSegment<'video'>;

export type OneBotSendAtSegment = z.infer<typeof zOneBotSendAtSegment>;
export type OneBotRecvAtSegment = DefineRecvSegment<'at', z.infer<typeof zOneBotAtData>>;

export type OneBotSendImageSegment = z.infer<typeof zOneBotSendImageSegment>;
export type OneBotRecvImageSegment = DefineRecvResourceSegment<'image', z.infer<typeof zOneBotImageExtra>>;

export type OneBotReplySegment = z.infer<typeof zOneBotReplySegment>;

export type OneBotPokeSegment = z.infer<typeof zOneBotPokeSegment>;

export type OneBotRecvForwardSegment = DefineRecvSegment<'forward', { id: string }>;

export type OneBotSendNodeSegment = z.infer<typeof zOneBotSendNodeSegment>;

export type OneBotRecvJsonSegment = { type: 'json', data: { data: string } };

export type OneBotRecvSegment =
    | OneBotTextSegment
    | OneBotFaceSegment
    | OneBotRecvRecordSegment
    | OneBotRecvVideoSegment
    | OneBotRecvAtSegment
    | OneBotRecvImageSegment
    | OneBotReplySegment
    | OneBotPokeSegment
    | OneBotRecvForwardSegment
    | OneBotRecvJsonSegment;

export type OneBotSendSegment =
    | OneBotTextSegment
    | OneBotFaceSegment
    | OneBotSendRecordSegment
    | OneBotSendAtSegment
    | OneBotSendImageSegment
    | OneBotReplySegment
    | OneBotPokeSegment
    | OneBotSendNodeSegment;