import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GeneralGrayTip = new NapProtoMsg({
    bizType: ProtoField(1, ScalarType.UINT32),
    templateParams: ProtoField(7, () => ({
        key: ProtoField(1, ScalarType.STRING),
        value: ProtoField(2, ScalarType.STRING),
    }), false, true),
});