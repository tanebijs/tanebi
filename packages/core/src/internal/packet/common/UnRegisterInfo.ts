import { RegisterDeviceInfo } from '@/internal/packet/common/RegisterDeviceInfo';
import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';

export const UnRegisterInfo = new NapProtoMsg({
    device: ProtoField(2, () => RegisterDeviceInfo.fields),
});