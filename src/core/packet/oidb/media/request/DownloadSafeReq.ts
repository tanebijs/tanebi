import { IndexNode } from '@/core/packet/oidb/media/IndexNode';
import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';

export const DownloadSafeReq = new NapProtoMsg({
    index: ProtoField(1, () => IndexNode.fields, true, false),
});
