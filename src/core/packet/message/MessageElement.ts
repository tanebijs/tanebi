import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { TextElement } from './element/TextElement';
import { FaceElement } from './element/FaceElement';
import { OnlineImageElement } from './element/OnlineImageElement';
import { NotOnlineImageElement } from './element/NotOnlineImageElement';
import { TransElement } from './element/TransElement';
import { MarketFaceElement } from './element/MarketFaceElement';
import { CustomFaceElement } from './element/CustomFaceElement';
import { ElementFlags2 } from './element/ElementFlags2';
import { RichMsgElement } from './element/RichMsgElement';
import { GroupFileElement } from './element/GroupFileElement';
import { ExtraInfoElement } from './element/ExtraInfoElement';
import { VideoFileElement } from './element/VideoFileElement';
import { AnonymousGroupMessageElement } from './element/AnonymousGroupMessageElement';
import { QQWalletMsgElement } from './element/QQWalletMsgElement';
import { CustomElement } from './element/CustomElement';
import { GeneralFlagsElement } from './element/GeneralFlagsElement';
import { SrcMsgElement } from './element/SrcMsgElement';
import { LightAppElement } from './element/LightAppElement';
import { CommonElement } from './element/CommonElement';

export const MessageElement = new NapProtoMsg({
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