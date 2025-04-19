import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvLogin0x10a = Tlv.tagged([
    TlvVariableField('tgt', 'bytes', 'none', false),
], '0x10a');
