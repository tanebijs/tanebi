import { defineAction, Ok } from '@app/action';
import { send_private_msg } from '@app/action/message/send_private_msg';
import { zOneBotInputUin } from '@app/common/types';
import { zOneBotInputMessage } from '@app/message';
import { z } from 'zod';

export const send_msg = defineAction(
    'send_msg',
    z.union([
        z.object({ user_id: zOneBotInputUin }),
        z.object({ group_id: zOneBotInputUin }),
    ]).and(zOneBotInputMessage),
    (ctx, payload) => {
        if ('user_id' in payload) {
            return send_private_msg.handler(ctx, payload);
        } else {
            return Ok({ message_id: 0 }); // TODO: Implement group message sending
        }
    },
);