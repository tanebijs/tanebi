import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const SsoNTEasyLogin = new NapProtoMsg({
    tempPassword: ProtoField(1, ScalarType.BYTES, true, false),
    captcha: ProtoField(2, () => ({
        ticket: ProtoField(1, ScalarType.STRING, true, false),
        randStr: ProtoField(2, ScalarType.STRING, true, false),
        aid: ProtoField(3, ScalarType.STRING, true, false),
    }), true, false),
});