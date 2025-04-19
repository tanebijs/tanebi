import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { randomUUID } from 'node:crypto';
import { deflateSync } from 'node:zlib';

export const forwardBuilder = defineOutgoing(
    'forward',
    (segment: { resId: string; preview: string[]; count: number; }) => {
        const fileId = randomUUID();
        const lightAppCompressed = deflateSync(JSON.stringify({
            app: 'com.tencent.multimsg',
            config: {
                autosize: 1,
                forward: 1,
                round: 1,
                type: 'normal',
                width: 300,
            },
            desc: '[聊天记录]',
            extra: JSON.stringify({
                filename: fileId,
                tsum: segment.preview.length,
            }),
            meta: {
                detail: {
                    news: segment.preview.map(pv => ({ text: pv })),
                    resid: segment.resId,
                    source: '聊天记录',
                    summary: `查看${segment.count}条转发消息`,
                    uniseq: fileId,
                },
            },
            prompt: '[聊天记录]',
            ver: '0.0.0.5',
            view: 'contact',
        }));
        return {
            lightApp: {
                data: Buffer.concat([
                    Buffer.from([0x01]),
                    lightAppCompressed,
                ]),
            },
        };
    },
);
