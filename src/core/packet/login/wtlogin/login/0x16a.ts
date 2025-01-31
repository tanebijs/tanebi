import { Tlv, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvLogin0x16a = Tlv.tagged([
    TlvVariableField('noPicSig', 'bytes', 'none', false),
], '0x16a');