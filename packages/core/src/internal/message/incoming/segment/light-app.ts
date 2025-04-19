import { defineIncoming } from '@/internal/message/incoming/segment-base';
import { inflateSync } from 'node:zlib';
import { z } from 'zod';

const lightAppSchema = z.object({
    app: z.string(),
}).passthrough();

export const lightAppParser = defineIncoming(
    'lightApp',
    'lightApp',
    (element): {
        app: string;
        payload: z.infer<typeof lightAppSchema>;
    } | undefined => {
        const payloadRaw = inflateSync(element.data!.subarray(1)).toString('utf-8');
        const payload = lightAppSchema.safeParse(JSON.parse(payloadRaw));
        if (!payload.success) {
            return undefined;
        }
        return {
            app: payload.data.app,
            payload: payload.data,
        };
    },
);
