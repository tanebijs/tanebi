import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvLogin0x16e = Tlv.tagged([
    TlvVariableField('deviceName', 'string', 'none', false),
], '0x16e');
