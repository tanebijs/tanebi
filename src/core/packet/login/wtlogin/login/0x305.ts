import { Tlv, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvLogin0x305 = Tlv.tagged([
    TlvVariableField('d2Key', 'bytes', 'none', false),
], '0x305');