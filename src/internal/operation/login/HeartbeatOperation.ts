import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoHeartBeat } from '@/internal/packet/common/SsoHeartBeat';

export const HeartbeatOperation = defineOperation(
    'heartbeat',
    'trpc.qq_new_tech.status_svc.StatusService.SsoHeartBeat',
    () => Buffer.from(SsoHeartBeat.encode({ type: 1 })),
);