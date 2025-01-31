import { Tlv, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvLogin0x147 = Tlv.tagged([
    TlvScalarField('appId', 'uint32'),
    TlvVariableField('ptVersion', 'string', 'uint16', false),
    TlvVariableField('packageName', 'string', 'uint16', false),
], '0x147');