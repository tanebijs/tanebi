import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const MessageElement = new NapProtoMsg({
    text: ProtoField(1, () => TextElement.fields, true),
    // TODO: more message types
});

export const TextElement = new NapProtoMsg({
    str: ProtoField(1, ScalarType.STRING),
    // [ProtoMember(2)] public string? Link { get; set; }
    // [ProtoMember(3)] public byte[]? Attr6Buf { get; set; }
    // [ProtoMember(4)] public byte[]? Attr7Buf { get; set; }
    // [ProtoMember(11)] public byte[]? Buf { get; set; }
    // [ProtoMember(12)] public byte[]? PbReserve { get; set; }
});