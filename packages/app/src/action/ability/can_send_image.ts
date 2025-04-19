import { defineAction, Ok } from '@app/action';
import { z } from 'zod';

export const can_send_image = defineAction(
    'can_send_image',
    z.object({}),
    () => Ok({ yes: true }),
);
