import { CommonHead } from '@/internal/packet/oidb/media/CommonHead';
import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const MultiMediaRespHead = ProtoMessage.of({
    common: ProtoField(1, () => CommonHead.fields, true, false),
    retCode: ProtoField(2, ScalarType.UINT32, false, false),
    message: ProtoField(3, ScalarType.STRING, true, false),
});
