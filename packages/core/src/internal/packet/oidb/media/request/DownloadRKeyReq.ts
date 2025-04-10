import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const DownloadRKeyReq = ProtoMessage.of({
    types: ProtoField(1, ScalarType.INT32, false, true),
});
