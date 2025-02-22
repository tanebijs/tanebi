import { AppInfo } from '@/common';

/**
 * A preset of app information for Linux protocol.
 * Use this when unable to fetch app information from the sign URL.
 */
export const LinuxAppInfoPreset: AppInfo = {
    'Os': 'Linux',
    'VendorOs': 'linux',
    'Kernel': 'Linux',
    'CurrentVersion': '3.2.15-30366',
    'MiscBitmap': 32764,
    'PtVersion': '2.0.0',
    'SsoVersion': 19,
    'PackageName': 'com.tencent.qq',
    'WtLoginSdk': 'nt.wtlogin.0.0.1',
    'AppId': 1600001615,
    'SubAppId': 537258424,
    'AppIdQrCode': 13697054,
    'AppClientVersion': 30366,
    'MainSigMap': 169742560,
    'SubSigMap': 0,
    'NTLoginType': 1,
};

/**
 * Fetch AppInfo from the given sign URL. This is the recommended way to get AppInfo.
 * @param signUrl The sign URL to fetch AppInfo from
 * @returns The AppInfo object
 */
export async function fetchAppInfoFromSignUrl(signUrl: string): Promise<AppInfo> {
    return fetch(signUrl.endsWith('/') ? `${signUrl}appinfo` : `${signUrl}/appinfo`)
        .then(res => res.json());
}