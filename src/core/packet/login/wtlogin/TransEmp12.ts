import { PackedTlv, Tlv, TlvFixedBytesField, TlvScalarField, TlvVariableField } from '@/core/util/binary/tlv';
import { TlvQrCode0x018 } from '@/core/packet/login/wtlogin/qrcode/0x018';
import { TlvQrCode0x019 } from '@/core/packet/login/wtlogin/qrcode/0x019';
import { TlvQrCode0x01e } from '@/core/packet/login/wtlogin/qrcode/0x01e';

export const OutgoingTransEmp12 = Tlv.plain([
    TlvScalarField('field0', 'uint16'), // 0
    TlvScalarField('appId', 'uint32'),
    TlvVariableField('qrSign', 'bytes', 'uint16', false),
    TlvScalarField('uin', 'uint64'), // 0
    TlvScalarField('version', 'uint8'), // 0
    TlvVariableField('field5', 'bytes', 'uint16', false), // empty
    TlvScalarField('field6', 'int16'), // 0
]);

export enum TransEmp12_QrCodeState {
    Confirmed = 0,
    CodeExpired = 17,
    WaitingForScan = 48,
    WaitingForConfirm = 53,
    Canceled = 54,
}

export const IncomingTransEmp12 = Tlv.plain([
    TlvScalarField('qrCodeState', 'uint8'),
    TlvVariableField('remaining', 'bytes', 'none', false),
]);

export const IncomingTransEmp12_Confirmed = Tlv.plain([
    TlvFixedBytesField('misc', 12),
    TlvVariableField('tlvPack', 'bytes', 'none', false),
]);

export const IncomingTransEmp12_Confirmed_TlvPack = PackedTlv.fromCollection([
    TlvQrCode0x018,
    TlvQrCode0x019,
    TlvQrCode0x01e,
]);