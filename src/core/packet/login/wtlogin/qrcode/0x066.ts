import { Tlv, TlvScalarField } from '@/core/util/binary/tlv';

export const TlvQrCode0x066 = Tlv.tagged([
    TlvScalarField('ptOsVersion', 'int32'),
], '0x66');