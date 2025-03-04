import { Tlv } from '@/internal/util/binary/tlv';

// Just empty;
// NTQQ has already depreciated this tlv
export const TlvLogin0x318 = Tlv.tagged([], '0x318');