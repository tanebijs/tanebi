import { defineAction, Ok } from '@app/action';
import { z } from 'zod';

export const can_send_record = defineAction(
    'can_send_record',
    z.object({}),
    () => Ok({ yes: true }),
);
