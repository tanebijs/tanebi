import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const TlvLogin0x543 = Tlv.tagged([
    TlvVariableField('protoBody', 'bytes', 'none', false),
], '0x543');

export const TlvLogin0x543Body = new NapProtoMsg({
    layer1: ProtoField(9, () => ({
        layer2: ProtoField(11, () => ({
            uid: ProtoField(1, ScalarType.STRING),
        })),
    })),
});