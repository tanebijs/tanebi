import { Tlv, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvLogin0x141 = Tlv.tagged([
    TlvScalarField('version', 'uint16'), // 0
    TlvVariableField('field1', 'string', 'uint16', false), // 'Unknown'
    TlvScalarField('networkType', 'uint16'), // 0
    TlvVariableField('apn', 'string', 'uint16', false), // ''
], '0x141');