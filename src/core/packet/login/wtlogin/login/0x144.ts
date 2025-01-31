import { Tlv, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvLogin0x144 = Tlv.tagged([
    TlvScalarField('tlvCount', 'uint16'), // 4 in total
    TlvVariableField('tlv_0x16e', 'bytes', 'none', false),
    TlvVariableField('tlv_0x147', 'bytes', 'none', false),
    TlvVariableField('tlv_0x128', 'bytes', 'none', false),
    TlvVariableField('tlv_0x124', 'bytes', 'none', false), // empty 12 bytes
], '0x144');