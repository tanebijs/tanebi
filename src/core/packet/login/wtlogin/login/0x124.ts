import { Tlv, TlvFixedBytesField } from '@/core/util/binary/tlv';

export const TlvLogin0x124 = Tlv.tagged([
    TlvFixedBytesField('empty', 12),
], '0x124');