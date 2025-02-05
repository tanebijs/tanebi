import { DeviceInfo } from '@/core/common/DeviceInfo';
import { Keystore } from '@/core/common/Keystore';
import { randomBytes } from 'node:crypto';

export function newDeviceInfo(): DeviceInfo {
    return {
        guid: randomBytes(16),
        macAddress: randomBytes(6),
        deviceName: `LagrangeTS-${randomBytes(3).toString('hex').toUpperCase()}`,
        systemKernel: 'Windows 10.0.19042',
        kernelVersion: '10.0.19042.0',
    };
}

export function newKeystore(): Keystore {
    return {
        uin: 0,
        passwordMd5: '',
        stub: {
            randomKey: randomBytes(16),
            tgtgtKey: Buffer.alloc(16),
        },
        session: {
            d2Key: Buffer.alloc(16),
            d2: Buffer.alloc(0),
            tgt: Buffer.alloc(0),
            sessionDate: new Date(),
            sequence: 0,
        },
        info: {
            age: 0,
            gender: 0,
            name: '',
        },
    };
}