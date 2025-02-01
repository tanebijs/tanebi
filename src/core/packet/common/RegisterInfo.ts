import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const RegisterInfo = new NapProtoMsg({
    guid: ProtoField(1, ScalarType.STRING, true),
    kickPC: ProtoField(2, ScalarType.INT32, true),
    currentVersion: ProtoField(3, ScalarType.STRING, true),
    isFirstRegisterProxyOnline: ProtoField(4, ScalarType.INT32, true),
    localeId: ProtoField(5, ScalarType.INT32, true),
    device: ProtoField(6, () => OnlineDeviceInfo.fields, true),
    setMute: ProtoField(7, ScalarType.INT32, true),
    registerVendorType: ProtoField(8, ScalarType.INT32, true),
    regType: ProtoField(9, ScalarType.INT32, true),
    businessInfo: ProtoField(10, () => OnlineBusinessInfo.fields, true),
    batteryStatus: ProtoField(11, ScalarType.INT32, true),
    field12: ProtoField(12, ScalarType.UINT32, true),
});

export const OnlineDeviceInfo = new NapProtoMsg({
    user: ProtoField(1, ScalarType.STRING),
    os: ProtoField(2, ScalarType.STRING),
    osVer: ProtoField(3, ScalarType.STRING),
    vendorName: ProtoField(4, ScalarType.STRING, true),
    osLower: ProtoField(5, ScalarType.STRING),
});

export const OnlineBusinessInfo = new NapProtoMsg({
    notifySwitch: ProtoField(1, ScalarType.UINT32),
    bindUinNotifySwitch: ProtoField(2, ScalarType.UINT32),
});

export const RegisterInfoResponse = new NapProtoMsg({
    message: ProtoField(2, ScalarType.STRING, true),
    timestamp: ProtoField(3, ScalarType.UINT32),
});