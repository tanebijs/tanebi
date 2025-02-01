import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const PbReserve = new NapProtoMsg({
    subType: ProtoField(1, ScalarType.SINT32, false, false),
    field3: ProtoField(3, ScalarType.SINT32, false, false),
    field4: ProtoField(4, ScalarType.SINT32, false, false),
    summary: ProtoField(8, ScalarType.STRING, true, false),
    field10: ProtoField(10, ScalarType.SINT32, false, false),
    field20: ProtoField(20, () => PbReserve2.fields, true, false),
    url: ProtoField(30, ScalarType.STRING, true, false),
    md5Str: ProtoField(31, ScalarType.STRING, true, false),
});

export const PbReserve1 = new NapProtoMsg({
    subType: ProtoField(1, ScalarType.SINT32, false, false),
    field3: ProtoField(3, ScalarType.SINT32, false, false),
    field4: ProtoField(4, ScalarType.SINT32, false, false),
    summary: ProtoField(9, ScalarType.STRING, true, false),
    field10: ProtoField(10, ScalarType.SINT32, false, false),
    field21: ProtoField(21, () => PbReserve2.fields, true, false),
    field31: ProtoField(31, ScalarType.STRING, true, false),
});

export const PbReserve2 = new NapProtoMsg({
    field1: ProtoField(1, ScalarType.SINT32, false, false),
    field2: ProtoField(2, ScalarType.STRING, true, false),
    field3: ProtoField(3, ScalarType.SINT32, false, false),
    field4: ProtoField(4, ScalarType.SINT32, false, false),
    field5: ProtoField(5, ScalarType.SINT32, false, false),
    md5Str: ProtoField(7, ScalarType.STRING, true, false),
});