import { WtLoginLogic } from '@/core/logic/login/WtLoginLogic';
import { Ecdh } from '@/core/util/crypto/ecdh';
import { OperationCollection } from '@/core/operation/OperationBase';
import { KeyExchangeOperation } from '@/core/operation/login/KeyExchangeOperation';
import { WtLoginOperation } from '@/core/operation/login/WtLoginOperation';
import { FetchQrCodeOperation } from '@/core/operation/login/FetchQrCodeOperation';
import { QueryQrCodeResultOperation } from '@/core/operation/login/QueryQrCodeResultOperation';
import { BotOnlineOperation } from '@/core/operation/login/BotOnlineOperation';
import { EventChannel } from '@/core/event/EventBase';
import { MessagePushEvent } from '@/core/event/message/MessagePushEvent';
import { NTLoginLogic } from '@/core/logic/login/NTLoginLogic';
import { NTEasyLoginOperation } from '@/core/operation/login/NTEasyLoginOperation';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { SsoLogic } from '@/core/logic/network/SsoLogic';
import { SendMessageOperation } from '@/core/operation/message/SendMessageOperation';
import { FetchGroupsOperation } from '@/core/operation/group/FetchGroupsOperation';
import { FetchFriendsOperation } from '@/core/operation/friend/FetchFriendsOperation';
import { FetchGroupMembersOperation } from '@/core/operation/group/FetchGroupMembersOperation';
import { HeartbeatOperation } from '@/core/operation/login/HeartbeatOperation';
import { DownloadGroupImageOperation } from '@/core/operation/message/DownloadGroupImageOperation';
import { DownloadPrivateImageOperation } from '@/core/operation/message/DownloadPrivateMessageOperation';

/**
 * The Bot object.
 */
export class BotContext {
    ecdh192 = new Ecdh('secp192k1', true);
    ecdh256 = new Ecdh('prime256v1', false);

    ssoLogic = new SsoLogic(this);

    wtLoginLogic = new WtLoginLogic(this);
    ntLoginLogic = new NTLoginLogic(this);

    ops = new OperationCollection(this, [
        FetchFriendsOperation,

        FetchGroupMembersOperation,
        FetchGroupsOperation,

        BotOnlineOperation,
        FetchQrCodeOperation,
        HeartbeatOperation,
        KeyExchangeOperation,
        NTEasyLoginOperation,
        QueryQrCodeResultOperation,
        WtLoginOperation,
        
        DownloadGroupImageOperation,
        DownloadPrivateImageOperation,
        SendMessageOperation,
    ]);

    events = new EventChannel(this, [
        MessagePushEvent,
    ]);

    constructor(
        public appInfo: AppInfo,
        public coreConfig: CoreConfig,
        public deviceInfo: DeviceInfo,
        public keystore: Keystore,
        public signProvider: SignProvider,
    ) {
    }
}