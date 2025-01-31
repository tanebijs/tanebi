import { AppInfo } from '@/core/common/AppInfo';
import { CoreConfig } from '@/core/common/CoreConfig';
import { DeviceInfo } from '@/core/common/DeviceInfo';
import { Keystore } from '@/core/common/Keystore';
import { NetworkLogic } from '@/core/logic/NetworkLogic';
import { SignProvider } from '@/core/common/SignProvider';
import { SsoPacketLogic } from '@/core/logic/SsoPacketLogic';
import { WtLoginLogic } from '@/core/logic/login/WtLoginLogic';
import { Ecdh } from '@/core/util/crypto/ecdh';
import { OperationCollection } from '@/core/operation/OperationBase';
import { KeyExchangeOperation } from '@/core/operation/login/KeyExchangeOperation';
import { TransEmpOperation } from '@/core/operation/login/TransEmpOperation';
import { WtLoginOperation } from '@/core/operation/login/WtLoginOperation';

/**
 * The Bot object.
 */
export class BotContext {
    ecdh192 = new Ecdh('secp192k1', true);
    ecdh256 = new Ecdh('prime256v1', false);

    networkLogic = new NetworkLogic(this);
    ssoPacketLogic = new SsoPacketLogic(this);

    wtLoginLogic = new WtLoginLogic(this);

    ops = new OperationCollection(this, [
        KeyExchangeOperation,
        TransEmpOperation,
        WtLoginOperation,
    ]);

    constructor(
        public appInfo: AppInfo,
        public coreConfig: CoreConfig,
        public deviceInfo: DeviceInfo,
        public keystore: Keystore,
        public signProvider: SignProvider,
    ) {
    }

    login() {
    }
}