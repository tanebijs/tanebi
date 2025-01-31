import { Tlv, TlvScalarField } from '@/core/util/binary/tlv';

export const TlvLogin0x166 = Tlv.tagged([
    TlvScalarField('imageType', 'uint8'), // 5
], '0x166');