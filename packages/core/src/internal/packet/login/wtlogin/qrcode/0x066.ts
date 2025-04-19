import { Tlv, TlvScalarField } from '@/internal/util/binary/tlv';

export const TlvQrCode0x066 = Tlv.tagged([
    TlvScalarField('ptOsVersion', 'int32'),
], '0x66');
