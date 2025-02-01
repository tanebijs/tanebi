import { defineOperation } from '@/core/operation/OperationBase';
import { SsoInfoSync, SsoInfoSyncResponse } from '@/core/packet/common/SsoInfoSync';

export const BotOnlineOperation = defineOperation(
    'botOnline',
    'trpc.msg.register_proxy.RegisterProxy.SsoInfoSync',
    (ctx) => Buffer.from(SsoInfoSync.encode({
        syncFlag: 735,
        reqRandom: Math.floor(Math.random() * 0xFFFFFFFF),
        curActiveStatus: 2,
        groupLastMsgTime: 0n,
        c2CInfoSync: {
            c2CMsgCookie: {
                c2CLastMsgTime: 0n,
            },
            c2CLastMsgTime: 0n,
            lastC2CMsgCookie: {
                c2CLastMsgTime: 0n,
            },
        },
        registerInfo: {
            guid: ctx.deviceInfo.guid.toString('hex'),
            kickPC: 0,
            currentVersion: ctx.appInfo.CurrentVersion,
            isFirstRegisterProxyOnline: 1,
            localeId: 2052,
            device: {
                user: ctx.deviceInfo.deviceName,
                os: ctx.appInfo.Kernel,
                osVer: ctx.deviceInfo.systemKernel,
                vendorName: '',
                osLower: ctx.appInfo.VendorOs,
            },
            setMute: 0,
            registerVendorType: 6,
            regType: 0,
            businessInfo: {
                notifySwitch: 1,
                bindUinNotifySwitch: 1,
            },
            batteryStatus: 0,
            field12: 1,
        },
        unknownStructure: {
            groupCode: 0,
            flag2: 2,
        },
        appState: {
            isDelayRequest: 0,
            appStatus: 0,
            silenceStatus: 0,
        },
    })),
    (ctx, payload) =>
        SsoInfoSyncResponse.decode(payload)
            ?.registerInfoResponse
            ?.message,
);