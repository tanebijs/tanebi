import EventEmitter from 'node:events';
import { WtLoginLogic } from '@/internal/logic/login/WtLoginLogic';
import { Ecdh } from '@/internal/util/crypto/ecdh';
import { OperationCollection } from '@/internal/operation/OperationBase';
import { KeyExchangeOperation } from '@/internal/operation/system/KeyExchangeOperation';
import { WtLoginOperation } from '@/internal/operation/system/WtLoginOperation';
import { FetchQrCodeOperation } from '@/internal/operation/system/FetchQrCodeOperation';
import { QueryQrCodeResultOperation } from '@/internal/operation/system/QueryQrCodeResultOperation';
import { BotOnlineOperation } from '@/internal/operation/system/BotOnlineOperation';
import { EventChannel } from '@/internal/event/EventBase';
import { MessagePushEvent } from '@/internal/event/message/MessagePushEvent';
import { NTLoginLogic } from '@/internal/logic/login/NTLoginLogic';
import { NTEasyLoginOperation } from '@/internal/operation/system/NTEasyLoginOperation';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { SsoLogic } from '@/internal/logic/network/SsoLogic';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { FetchGroupsOperation } from '@/internal/operation/group/FetchGroupsOperation';
import { FetchFriendsOperation } from '@/internal/operation/friend/FetchFriendsOperation';
import { FetchGroupMembersOperation } from '@/internal/operation/group/FetchGroupMembersOperation';
import { HeartbeatOperation } from '@/internal/operation/system/HeartbeatOperation';
import { DownloadGroupImageOperation } from '@/internal/operation/highway/DownloadGroupImageOperation';
import { DownloadPrivateImageOperation } from '@/internal/operation/highway/DownloadPrivateImageOperation';
import { FetchHighwayUrlOperation } from '@/internal/operation/highway/FetchHighwayUrlOperation';
import { UploadGroupImageOperation } from '@/internal/operation/highway/UploadGroupImageOperation';
import { HighwayLogic } from '@/internal/logic/network/HighwayLogic';
import { UploadPrivateImageOperation } from '@/internal/operation/highway/UploadPrivateImageOperation';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchUserInfoOperation } from '@/internal/operation/friend/FetchUserInfoOperation';
import { SetMemberSpecialTitleOperation } from '@/internal/operation/group/SetMemberSpecialTitleOperation';
import { SendGrayTipPokeOperation } from '@/internal/operation/message/SendGrayTipPokeOperation';
import { NotifyLogic } from '@/internal/logic/NotifyLogic';
import { SetMemberCardOperation } from '@/internal/operation/group/SetMemberCardOperation';
import { AddGroupReactionOperation } from '@/internal/operation/group/AddGroupReactionOperation';
import { RemoveGroupReactionOperation } from '@/internal/operation/group/RemoveGroupReactionOperation';
import { RecallFriendMessageOperation } from '@/internal/operation/message/RecallFriendMessageOperation';
import { RecallGroupMessageOperation } from '@/internal/operation/message/RecallGroupMessageOperation';
import { LeaveGroupOperation } from '@/internal/operation/group/LeaveGroupOperation';
import { DownloadGroupRecordOperation } from '@/internal/operation/highway/DownloadGroupRecordOperation';
import { DownloadPrivateRecordOperation } from '@/internal/operation/highway/DownloadPrivateRecordOperation';

/**
 * The internal context of the bot
 */
export class BotContext {
    ecdh192 = new Ecdh('secp192k1', true);
    ecdh256 = new Ecdh('prime256v1', false);

    highwayLogic = new HighwayLogic(this);
    ssoLogic = new SsoLogic(this);
    wtLoginLogic = new WtLoginLogic(this);
    ntLoginLogic = new NTLoginLogic(this);
    notifyLogic = new NotifyLogic(this);

    ops = new OperationCollection(this, [
        FetchFriendsOperation,
        FetchUserInfoOperation,

        AddGroupReactionOperation,
        FetchGroupMembersOperation,
        FetchGroupNotifiesOperation,
        FetchGroupsOperation,
        LeaveGroupOperation,
        RemoveGroupReactionOperation,
        SetMemberCardOperation,
        SetMemberSpecialTitleOperation,

        DownloadGroupImageOperation,
        DownloadGroupRecordOperation,
        DownloadPrivateImageOperation,
        DownloadPrivateRecordOperation,
        FetchHighwayUrlOperation,
        UploadGroupImageOperation,
        UploadPrivateImageOperation,

        BotOnlineOperation,
        FetchQrCodeOperation,
        HeartbeatOperation,
        KeyExchangeOperation,
        NTEasyLoginOperation,
        QueryQrCodeResultOperation,
        WtLoginOperation,
        
        SendGrayTipPokeOperation,
        SendMessageOperation,
        RecallFriendMessageOperation,
        RecallGroupMessageOperation,
    ]);

    events = new EventChannel(this, [
        MessagePushEvent,
    ]);

    eventsDX = new EventEmitter<{
        friendRequest: [number, string, string, string]; // fromUin, fromUid, message, via
        friendPoke: [number, number, string, string, string?]; // fromUin, toUin, actionStr, actionImgUrl, suffix,
        friendRecall: [string, number, string] // fromUid, clientSequence, tip

        groupJoinRequest: [number, string]; // groupUin, memberUid
        groupInvitedJoinRequest: [number, string, string]; // groupUin, targetUid, invitorUid
        groupInvitationRequest: [number, string]; // groupUin, invitorUid
        groupAdminChange: [number, string, boolean]; // groupUin, targetUid, isPromote
        groupMemberIncrease: [number, string, string?]; // groupUin, memberUid, operatorUid?
        groupMemberDecrease: [number, string, string?]; // groupUin, memberUid, operatorUid?
        groupMute: [number, string, string, number]; // groupUin, operatorUid, targetUid, duration
        groupMuteAll: [number, string, boolean]; // groupUin, operatorUid, isSet
        groupPoke: [number, number, number, string, string, string?]; // groupUin, fromUin, toUin, actionStr, actionImgUrl, suffix
        groupEssenceMessageChange: [number, number, number, boolean]; // groupUin, sequence, operatorUin, isAdd
        groupRecall: [number, number, string, string]; // groupUin, sequence, tip, operatorUid
        groupReaction: [number, number, string, string, boolean, number]; // groupUin, sequence, operatorUid, reactionCode, isAdd, count
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