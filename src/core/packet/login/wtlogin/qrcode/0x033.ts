import { Tlv, TlvFixedBytesField } from '@/core/util/binary/tlv';

export const TlvQrCode0x033 = Tlv.tagged([
    TlvFixedBytesField('guid', 16),
], '0x33');