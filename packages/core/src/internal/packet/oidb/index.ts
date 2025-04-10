import { ProtoMessage, ProtoField, ScalarType } from '@tanebijs/protobuf';

export const OidbBase = ProtoMessage.of({
    command: ProtoField(1, ScalarType.UINT32, false, false),
    subCommand: ProtoField(2, ScalarType.UINT32, false, false),
    errorCode: ProtoField(3, ScalarType.UINT32, false, false),
    body: ProtoField(4, ScalarType.BYTES, true, false),
    errorMsg: ProtoField(5, ScalarType.STRING, true, false),
    lafter: ProtoField(7, () => ({
        type: ProtoField(1, ScalarType.SINT32, false, false),
        d2: ProtoField(2, ScalarType.BYTES, true, false),
        subAppid: ProtoField(3, ScalarType.UINT32, false, false),
    }), true, false),
    properties: ProtoField(11, () => ({
        key: ProtoField(1, ScalarType.STRING, false, false),
        value: ProtoField(2, ScalarType.BYTES, false, false),
    }), false, true),
    reserved: ProtoField(12, ScalarType.INT32, false, false),
});