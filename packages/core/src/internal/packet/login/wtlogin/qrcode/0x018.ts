import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvQrCode0x018 = Tlv.tagged([
    TlvVariableField('tempPassword', 'bytes', 'none', false),
], '0x18');