import { RegisterDeviceInfo } from '@/internal/packet/common/RegisterDeviceInfo';
import { ProtoMessage, ProtoField } from '@tanebijs/protobuf';

export const UnRegisterInfo = ProtoMessage.of({
    device: ProtoField(2, () => RegisterDeviceInfo.fields),
});