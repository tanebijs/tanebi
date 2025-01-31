import { PackedTlv, Tlv, TlvVariableField } from '@/core/util/binary/tlv';
import { TlvLogin0x11a } from '@/core/packet/login/wtlogin/login/0x11a';
import { TlvLogin0x305 } from '@/core/packet/login/wtlogin/login/0x305';
import { TlvLogin0x543 } from '@/core/packet/login/wtlogin/login/0x543';
import { TlvLogin0x10a } from '@/core/packet/login/wtlogin/login/0x10a';
import { TlvLogin0x143 } from '@/core/packet/login/wtlogin/login/0x143';
import { TlvLogin0x106 } from '@/core/packet/login/wtlogin/login/0x106';

export const TlvLogin0x119 = Tlv.tagged([
    TlvVariableField('encryptedTlv', 'bytes', 'none', false),
], '0x119');

export const TlvLogin0x119_DecryptedPack = PackedTlv.fromCollection([
    TlvLogin0x11a,
    TlvLogin0x305,
    TlvLogin0x543,
    TlvLogin0x10a,
    TlvLogin0x143,
    TlvLogin0x106,
]);