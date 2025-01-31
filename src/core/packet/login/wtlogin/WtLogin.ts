import { PackedTlv, Tlv, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';
import { TlvLogin0x106 } from '@/core/packet/login/wtlogin/login/0x106';
import { TlvLogin0x144 } from '@/core/packet/login/wtlogin/login/0x144';
import { TlvLogin0x116 } from '@/core/packet/login/wtlogin/login/0x116';
import { TlvLogin0x142 } from '@/core/packet/login/wtlogin/login/0x142';
import { TlvLogin0x145 } from '@/core/packet/login/wtlogin/login/0x145';
import { TlvLogin0x018 } from '@/core/packet/login/wtlogin/login/0x018';
import { TlvLogin0x141 } from '@/core/packet/login/wtlogin/login/0x141';
import { TlvLogin0x177 } from '@/core/packet/login/wtlogin/login/0x177';
import { TlvLogin0x191 } from '@/core/packet/login/wtlogin/login/0x191';
import { TlvLogin0x100 } from '@/core/packet/login/wtlogin/login/0x100';
import { TlvLogin0x107 } from '@/core/packet/login/wtlogin/login/0x107';
import { TlvLogin0x318 } from '@/core/packet/login/wtlogin/login/0x318';
import { TlvLogin0x16a } from '@/core/packet/login/wtlogin/login/0x16a';
import { TlvLogin0x166 } from '@/core/packet/login/wtlogin/login/0x166';
import { TlvLogin0x521 } from '@/core/packet/login/wtlogin/login/0x521';
import { TlvLogin0x119 } from '@/core/packet/login/wtlogin/login/0x119';
import { TlvLogin0x146 } from '@/core/packet/login/wtlogin/login/0x146';

export const OutgoingWtLogin = PackedTlv.fromCollection([
    TlvLogin0x106,
    TlvLogin0x144,
    TlvLogin0x116,
    TlvLogin0x142,
    TlvLogin0x145,
    TlvLogin0x018,
    TlvLogin0x141,
    TlvLogin0x177,
    TlvLogin0x191,
    TlvLogin0x100,
    TlvLogin0x107,
    TlvLogin0x318,
    TlvLogin0x16a,
    TlvLogin0x166,
    TlvLogin0x521,
]);

export enum WtLoginState {
    Success = 0,
    Slider = 2,
    SmsRequired = 160,
}

export const IncomingWtLogin = Tlv.plain([
    TlvScalarField('command', 'uint16'),
    TlvScalarField('state', 'uint8'),
    TlvVariableField('tlvPack', 'bytes', 'none', false),
]);

export const IncomingWtLogin_TlvPack = PackedTlv.fromCollection([
    TlvLogin0x119,
    TlvLogin0x146,
]);