import { Tlv, TlvScalarField } from '@/internal/util/binary/tlv';

export const TlvQrCode0x01c = Tlv.tagged([
    TlvScalarField('expirationInSec', 'uint32'),
    TlvScalarField('expirationInMin', 'uint16'),
], '0x1c');
