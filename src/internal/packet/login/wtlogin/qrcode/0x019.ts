import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvQrCode0x019 = Tlv.tagged([
    TlvVariableField('noPicSig', 'bytes', 'none', false),
], '0x19');