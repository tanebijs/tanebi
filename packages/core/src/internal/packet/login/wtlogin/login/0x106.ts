import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvLogin0x106 = Tlv.tagged([
    TlvVariableField('tempPassword', 'bytes', 'none', false),
], '0x106');
