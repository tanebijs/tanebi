import { RKeyInfo } from './RKeyInfo';
import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';

export const DownloadRKeyResp = new NapProtoMsg({
    rKeys: ProtoField(1, () => RKeyInfo.fields, false, true),
});
