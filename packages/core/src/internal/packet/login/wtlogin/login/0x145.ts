import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvLogin0x145 = Tlv.tagged([
    TlvVariableField('guid', 'bytes', 'none', false),
], '0x145');