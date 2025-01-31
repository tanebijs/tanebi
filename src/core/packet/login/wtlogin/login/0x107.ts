import { Tlv, TlvScalarField } from '@/core/util/binary/tlv';

export const TlvLogin0x107 = Tlv.tagged([
    TlvScalarField('picType', 'uint16'), // 0x0001
    TlvScalarField('capType', 'uint8'), // 0x0D
    TlvScalarField('picSize', 'uint16'), // 0x0000
    TlvScalarField('retType', 'uint8'), // 0x01
], '0x107');