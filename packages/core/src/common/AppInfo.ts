/**
 * Application info, fields from Lagrange.Core
 */
export interface AppInfo {
    // 'Windows' | 'Linux' | 'Mac'
    Os: string;

    // 'Windows_NT' | 'Linux' | 'Darwin'
    Kernel: string;

    // 'win32' | 'linux' | 'mac'
    VendorOs: string;

    // `${major}.${minor}.${patch}-${appClientVersion}`
    CurrentVersion: string;

    // 32764
    MiscBitmap: number;

    // '2.0.0'
    PtVersion: string;

    // 19
    SsoVersion: number;

    // 'com.tencent.qq'
    PackageName: string;

    // 'nt.wtlogin.0.0.1'
    WtLoginSdk: string;

    // win: 1600001604;
    // linux: 1600001612;
    // mac: 1600001615
    AppId: number;

    SubAppId: number;

    AppIdQrCode: number;

    AppClientVersion: number;

    // 169742560
    MainSigMap: number;

    // 0
    SubSigMap: number;

    // win & mac: 5; linux: 1
    NTLoginType: number;
}
