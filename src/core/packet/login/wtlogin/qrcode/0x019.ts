import { Tlv, TlvVariableField } from '@/core/util/binary/tlv';

export const TlvQrCode0x019 = Tlv.tagged([
    TlvVariableField('noPicSig', 'bytes', 'none', false),
], '0x19');