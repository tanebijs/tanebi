import { AnonymousGroupMessageElement } from '@/internal/packet/message/element/AnonymousGroupMessageElement';
import { CommonElement } from '@/internal/packet/message/element/CommonElement';
import { CustomElement } from '@/internal/packet/message/element/CustomElement';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { ElementFlags2 } from '@/internal/packet/message/element/ElementFlags2';
import { ExtraInfoElement } from '@/internal/packet/message/element/ExtraInfoElement';
import { FaceElement } from '@/internal/packet/message/element/FaceElement';
import { GeneralFlagsElement } from '@/internal/packet/message/element/GeneralFlagsElement';
import { GroupFileElement } from '@/internal/packet/message/element/GroupFileElement';
import { LightAppElement } from '@/internal/packet/message/element/LightAppElement';
import { MarketFaceElement } from '@/internal/packet/message/element/MarketFaceElement';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { OnlineImageElement } from '@/internal/packet/message/element/OnlineImageElement';
import { QQWalletMsgElement } from '@/internal/packet/message/element/QQWalletMsgElement';
import { RichMsgElement } from '@/internal/packet/message/element/RichMsgElement';
import { SrcMsgElement } from '@/internal/packet/message/element/SrcMsgElement';
import { TextElement } from '@/internal/packet/message/element/TextElement';
import { TransElement } from '@/internal/packet/message/element/TransElement';
import { VideoFileElement } from '@/internal/packet/message/element/VideoFileElement';
import { ProtoField, ProtoMessage } from '@tanebijs/protobuf';

export const MessageElement = ProtoMessage.of({
    text: ProtoField(1, () => TextElement.fields, true, false),
    face: ProtoField(2, () => FaceElement.fields, true, false),
    onlineImage: ProtoField(3, () => OnlineImageElement.fields, true, false),
    notOnlineImage: ProtoField(4, () => NotOnlineImageElement.fields, true, false),
    trans: ProtoField(5, () => TransElement.fields, true, false),
    marketFace: ProtoField(6, () => MarketFaceElement.fields, true, false),
    customFace: ProtoField(8, () => CustomFaceElement.fields, true, false),
    flags2: ProtoField(9, () => ElementFlags2.fields, true, false),
    richMsg: ProtoField(12, () => RichMsgElement.fields, true, false),
    groupFile: ProtoField(13, () => GroupFileElement.fields, true, false),
    extraInfo: ProtoField(16, () => ExtraInfoElement.fields, true, false),
    videoFile: ProtoField(19, () => VideoFileElement.fields, true, false),
    anonGroupMsg: ProtoField(21, () => AnonymousGroupMessageElement.fields, true, false),
    qqWalletMsg: ProtoField(24, () => QQWalletMsgElement.fields, true, false),
    custom: ProtoField(31, () => CustomElement.fields, true, false),
    generalFlags: ProtoField(37, () => GeneralFlagsElement.fields, true, false),
    srcMsg: ProtoField(45, () => SrcMsgElement.fields, true, false),
    lightApp: ProtoField(51, () => LightAppElement.fields, true, false),
    common: ProtoField(53, () => CommonElement.fields, true, false),
});
