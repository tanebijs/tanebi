import { Tlv, TlvScalarField } from '@/core/util/binary/tlv';

export const TlvQrCode0x01d = Tlv.tagged([
    TlvScalarField('field0', 'uint8'),
    TlvScalarField('miscBitmap', 'uint32'),
    TlvScalarField('field2', 'uint32'),
    TlvScalarField('field3', 'uint8'),
], '0x1d');