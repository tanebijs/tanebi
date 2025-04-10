import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const SsoNTEasyLogin = ProtoMessage.of({
    tempPassword: ProtoField(1, ScalarType.BYTES, true, false),
    captcha: ProtoField(2, () => ({
        ticket: ProtoField(1, ScalarType.STRING, true, false),
        randStr: ProtoField(2, ScalarType.STRING, true, false),
        aid: ProtoField(3, ScalarType.STRING, true, false),
    }), true, false),
});