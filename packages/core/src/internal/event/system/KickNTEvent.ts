import { defineEvent } from '@/internal/event/EventBase';
import { StatusKickNT } from '@/internal/packet/common/StatusKickNT';

export const KickNTEvent = defineEvent(
    'kickNT',
    'trpc.qq_new_tech.status_svc.StatusService.KickNT',
    (ctx, payload) => StatusKickNT.decode(payload),
);
