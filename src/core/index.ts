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
import { DownloadPrivateImageOperation } from '@/core/operation/message/DownloadPrivateImageOperation';
import { FetchHighwayUrlOperation } from '@/core/operation/highway/FetchHighwayUrlOperation';
import { UploadGroupImageOperation } from '@/core/operation/message/UploadGroupImageOperation';
import { HighwayLogic } from '@/core/logic/network/HighwayLogic';
import { UploadPrivateImageOperation } from '@/core/operation/message/UploadPrivateImageOperation';
import EventEmitter from 'node:events';
import { FetchGroupNotifiesOperation } from '@/core/operation/group/FetchGroupNotifiesOperation';
import { FetchUserInfoOperation } from '@/core/operation/friend/FetchUserInfoOperation';

/**
 * The Bot object.
 */
export class BotContext {
    ecdh192 = new Ecdh('secp192k1', true);
    ecdh256 = new Ecdh('prime256v1', false);

    highwayLogic = new HighwayLogic(this);
    ssoLogic = new SsoLogic(this);

    wtLoginLogic = new WtLoginLogic(this);
    ntLoginLogic = new NTLoginLogic(this);

    ops = new OperationCollection(this, [
        FetchFriendsOperation,
        FetchUserInfoOperation,

        FetchGroupMembersOperation,
        FetchGroupNotifiesOperation,
        FetchGroupsOperation,

        FetchHighwayUrlOperation,

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
        UploadGroupImageOperation,
        UploadPrivateImageOperation,
    ]);

    events = new EventChannel(this, [
        MessagePushEvent,
    ]);

    eventsDX = new EventEmitter<{
        groupJoinRequest: [number, string]; // groupUin, memberUid
        groupInvitedJoinRequest: [number, string, string]; // groupUin, targetUid, invitorUid
        groupInvitationRequest: [number, string]; // groupUin, invitorUid
        groupAdminChange: [number, string, boolean]; // groupUin, targetUid, isPromote
        groupMemberIncrease: [number, string, string?]; // groupUin, memberUid, operatorUid?
        groupMemberDecrease: [number, string, string?]; // groupUin, memberUid, operatorUid?
    }>();

    constructor(
        public appInfo: AppInfo,
        public coreConfig: CoreConfig,
        public deviceInfo: DeviceInfo,
        public keystore: Keystore,
        public signProvider: SignProvider,
    ) {
    }
}