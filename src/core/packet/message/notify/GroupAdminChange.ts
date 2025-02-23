import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupAdminChange = new NapProtoMsg({
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(4, () => ({
        unset: ProtoField(1, () => ({
            targetUid: ProtoField(1, ScalarType.STRING),
        }), true),
        set: ProtoField(2, () => ({
            targetUid: ProtoField(1, ScalarType.STRING),
        }), true),
    })),
});