import { PackedTlv, Tlv, TlvVariableField } from '@/core/util/binary/tlv';
import { TlvLogin0x16e } from '@/core/packet/login/wtlogin/login/0x16e';
import { TlvLogin0x147 } from '@/core/packet/login/wtlogin/login/0x147';
import { TlvLogin0x128 } from '@/core/packet/login/wtlogin/login/0x128';
import { TlvLogin0x124 } from '@/core/packet/login/wtlogin/login/0x124';

export const TlvLogin0x144 = Tlv.tagged([
    TlvVariableField('tgtgtEncrypted', 'bytes', 'none', false),
], '0x144');

export const TlvLogin0x114_TlvBody = PackedTlv.fromCollection([
    TlvLogin0x16e,
    TlvLogin0x147,
    TlvLogin0x128,
    TlvLogin0x124,
]);