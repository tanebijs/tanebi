import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { ProtoMessage, ProtoField } from '@tanebijs/protobuf';

export const DownloadSafeReq = ProtoMessage.of({
    index: ProtoField(1, () => IndexNode.fields, true, false),
});
