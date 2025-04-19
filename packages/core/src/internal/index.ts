import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { EventChannel } from '@/internal/event/EventBase';
import { MessagePushEvent } from '@/internal/event/message/MessagePushEvent';
import { KickNTEvent } from '@/internal/event/system/KickNTEvent';
import { NTLoginLogic } from '@/internal/logic/login/NTLoginLogic';
import { WtLoginLogic } from '@/internal/logic/login/WtLoginLogic';
import { HighwayLogic } from '@/internal/logic/network/HighwayLogic';
import { SsoLogic } from '@/internal/logic/network/SsoLogic';
import { NotifyLogic } from '@/internal/logic/NotifyLogic';
import { FetchFriendsOperation } from '@/internal/operation/friend/FetchFriendsOperation';
import { FetchUserInfoOperation } from '@/internal/operation/friend/FetchUserInfoOperation';
import { HandleFriendRequestOperation } from '@/internal/operation/friend/HandleFriendRequestOperation';
import { SendProfileLikeOperation } from '@/internal/operation/friend/SendProfileLikeOperation';
import { AddGroupReactionOperation } from '@/internal/operation/group/AddGroupReactionOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifies';
import { FetchGroupMembersOperation } from '@/internal/operation/group/FetchGroupMembersOperation';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupsOperation } from '@/internal/operation/group/FetchGroupsOperation';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';
import { KickMemberOperation } from '@/internal/operation/group/KickMemberOperation';
import { LeaveGroupOperation } from '@/internal/operation/group/LeaveGroupOperation';
import { MuteAllMembersOperation } from '@/internal/operation/group/MuteAllMembersOperation';
import { MuteMemberOperation } from '@/internal/operation/group/MuteMemberOperation';
import { RemoveGroupReactionOperation } from '@/internal/operation/group/RemoveGroupReactionOperation';
import { SetGroupNameOperation } from '@/internal/operation/group/SetGroupNameOperation';
import { SetMemberAdminOperation } from '@/internal/operation/group/SetMemberAdminOperation';
import { SetMemberCardOperation } from '@/internal/operation/group/SetMemberCardOperation';
import { SetMemberSpecialTitleOperation } from '@/internal/operation/group/SetMemberSpecialTitleOperation';
import { DownloadGroupImageOperation } from '@/internal/operation/highway/DownloadGroupImageOperation';
import { DownloadGroupRecordOperation } from '@/internal/operation/highway/DownloadGroupRecordOperation';
import { DownloadPrivateImageOperation } from '@/internal/operation/highway/DownloadPrivateImageOperation';
import { DownloadPrivateRecordOperation } from '@/internal/operation/highway/DownloadPrivateRecordOperation';
import { DownloadVideoOperation } from '@/internal/operation/highway/DownloadVideoOperation';
import { FetchHighwayUrlOperation } from '@/internal/operation/highway/FetchHighwayUrlOperation';
import { UploadGroupImageOperation } from '@/internal/operation/highway/UploadGroupImageOperation';
import { UploadGroupRecordOperation } from '@/internal/operation/highway/UploadGroupRecordOperation';
import { UploadPrivateImageOperation } from '@/internal/operation/highway/UploadPrivateImageOperation';
import { UploadPrivateRecordOperation } from '@/internal/operation/highway/UploadPrivateRecordOperation';
import { DownloadLongMessageOperation } from '@/internal/operation/message/DownloadLongMessageOperation';
import { FetchFaceDetailsOperation } from '@/internal/operation/message/FetchFaceDetailsOperation';
import { RecallFriendMessageOperation } from '@/internal/operation/message/RecallFriendMessageOperation';
import { RecallGroupMessageOperation } from '@/internal/operation/message/RecallGroupMessageOperation';
import { SendGrayTipPokeOperation } from '@/internal/operation/message/SendGrayTipPokeOperation';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { UploadLongMessageOperation } from '@/internal/operation/message/UploadLongMessageOperation';
import { OperationCollection } from '@/internal/operation/OperationBase';
import { BotOfflineOperation } from '@/internal/operation/system/BotOfflineOperation';
import { BotOnlineOperation } from '@/internal/operation/system/BotOnlineOperation';
import { FetchQrCodeOperation } from '@/internal/operation/system/FetchQrCodeOperation';
import { HeartbeatOperation } from '@/internal/operation/system/HeartbeatOperation';
import { KeyExchangeOperation } from '@/internal/operation/system/KeyExchangeOperation';
import { NTEasyLoginOperation } from '@/internal/operation/system/NTEasyLoginOperation';
import { QueryQrCodeResultOperation } from '@/internal/operation/system/QueryQrCodeResultOperation';
import { WtLoginOperation } from '@/internal/operation/system/WtLoginOperation';
import { DecreaseType, IncreaseType } from '@/internal/packet/message/notify/GroupMemberChange';
import { Ecdh } from '@/internal/util/crypto/ecdh';
import EventEmitter from 'node:events';

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

    readonly log = new EventEmitter<{
        trace: [string, string]; // module, message
        info: [string, string]; // module, message
        warning: [string, string, unknown?]; // module, message, error
    }>();

    ops = new OperationCollection(this, [
        FetchFriendsOperation,
        FetchUserInfoOperation,
        HandleFriendRequestOperation,
        SendProfileLikeOperation,

        AddGroupReactionOperation,
        FetchGroupFilteredNotifiesOperation,
        FetchGroupMembersOperation,
        FetchGroupNotifiesOperation,
        FetchGroupsOperation,
        HandleGroupFilteredRequestOperation,
        HandleGroupRequestOperation,
        KickMemberOperation,
        LeaveGroupOperation,
        MuteAllMembersOperation,
        MuteMemberOperation,
        RemoveGroupReactionOperation,
        SetGroupNameOperation,
        SetMemberAdminOperation,
        SetMemberCardOperation,
        SetMemberSpecialTitleOperation,

        DownloadGroupImageOperation,
        DownloadGroupRecordOperation,
        DownloadPrivateImageOperation,
        DownloadPrivateRecordOperation,
        DownloadVideoOperation,
        FetchHighwayUrlOperation,
        UploadGroupImageOperation,
        UploadGroupRecordOperation,
        UploadPrivateImageOperation,
        UploadPrivateRecordOperation,

        DownloadLongMessageOperation,
        FetchFaceDetailsOperation,
        RecallFriendMessageOperation,
        RecallGroupMessageOperation,
        SendGrayTipPokeOperation,
        SendMessageOperation,
        UploadLongMessageOperation,

        BotOfflineOperation,
        BotOnlineOperation,
        FetchQrCodeOperation,
        HeartbeatOperation,
        KeyExchangeOperation,
        NTEasyLoginOperation,
        QueryQrCodeResultOperation,
        WtLoginOperation,
    ]);

    events = new EventChannel(this, [
        MessagePushEvent,

        KickNTEvent,
    ]);

    eventsDX = new EventEmitter<{
        friendRequest: [number, string, string, string]; // fromUin, fromUid, message, via
        friendPoke: [number, number, string, string, string?]; // fromUin, toUin, actionStr, actionImgUrl, suffix,
        friendRecall: [string, number, string]; // fromUid, clientSequence, tip

        groupJoinRequest: [number, string]; // groupUin, memberUid
        groupInvitedJoinRequest: [number, string, string]; // groupUin, targetUid, invitorUid
        groupInvitationRequest: [number, string]; // groupUin, invitorUid
        groupAdminChange: [number, string, boolean]; // groupUin, targetUid, isPromote
        groupMemberIncrease: [number, string, IncreaseType, string?]; // groupUin, memberUid, type, operatorUid?
        groupMemberDecrease: [number, string, DecreaseType, string?]; // groupUin, memberUid, type, operatorUid?
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

    async renewSsoLogic() {
        this.ssoLogic.socket.destroy();
        this.ssoLogic = new SsoLogic(this);
        await this.ssoLogic.connectToMsfServer();
    }
}
