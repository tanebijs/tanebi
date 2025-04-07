import { defineAction } from '@app/action';
import { send_group_forward_msg } from '@app/action/message/send_group_forward_msg';
import { send_private_forward_msg } from '@app/action/message/send_private_forward_msg';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotSendNodeSegment } from '@app/message/segment';
import { z } from 'zod';

export const send_forward_msg = defineAction(
    'send_forward_msg',
    z.union([
        z.object({ user_id: zOneBotInputUin }),
        z.object({ group_id: zOneBotInputUin }),
    ]).and(z.object({
        messages: z.array(zOneBotSendNodeSegment).min(1),
    })),
    (ctx, payload) => {
        if ('user_id' in payload) {
            return send_private_forward_msg.handler(ctx, payload);
        } else {
            return send_group_forward_msg.handler(ctx, payload);
        }
    },
);