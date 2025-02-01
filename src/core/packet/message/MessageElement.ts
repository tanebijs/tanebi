import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';
import { Text } from '@/core/packet/message/components/Text';
import { Face } from '@/core/packet/message/components/Face';
import { OnlineImage } from '@/core/packet/message/components/OnlineImage';
import { NotOnlineImage } from '@/core/packet/message/components/NotOnlineImage';
import { TransElem } from '@/core/packet/message/components/TransElem';
import { Marketface } from '@/core/packet/message/components/Marketface';
import { CustomFace } from '@/core/packet/message/components/CustomFace';
import { ElemFlags2 } from '@/core/packet/message/components/ElemFlags2';
import { RichMsg } from '@/core/packet/message/components/RichMsg';
import { GroupFile } from '@/core/packet/message/components/GroupFile';
import { ExtraInfo } from '@/core/packet/message/components/ExtraInfo';
import { VideoFile } from '@/core/packet/message/components/VideoFile';
import { AnonymousGroupMessage } from '@/core/packet/message/components/AnonymousGroupMessage';
import { QQWalletMsg } from '@/core/packet/message/components/QQWalletMsg';
import { GeneralFlags } from '@/core/packet/message/components/GeneralFlags';
import { SrcMsg } from '@/core/packet/message/components/SrcMsg';
import { LightAppElem } from '@/core/packet/message/components/LightAppElem';
import { CommonElem } from '@/core/packet/message/components/CommonElem';
import { CustomElem } from '@/core/packet/message/components/CustomElem';

export const MessageElement = new NapProtoMsg({
    text: ProtoField(1, () => Text.fields, true, false),
    face: ProtoField(2, () => Face.fields, true, false),
    onlineImage: ProtoField(3, () => OnlineImage.fields, true, false),
    notOnlineImage: ProtoField(4, () => NotOnlineImage.fields, true, false),
    transElem: ProtoField(5, () => TransElem.fields, true, false),
    marketface: ProtoField(6, () => Marketface.fields, true, false),
    customFace: ProtoField(8, () => CustomFace.fields, true, false),
    elemFlags2: ProtoField(9, () => ElemFlags2.fields, true, false),
    richMsg: ProtoField(12, () => RichMsg.fields, true, false),
    groupFile: ProtoField(13, () => GroupFile.fields, true, false),
    extraInfo: ProtoField(16, () => ExtraInfo.fields, true, false),
    videoFile: ProtoField(19, () => VideoFile.fields, true, false),
    anonGroupMsg: ProtoField(21, () => AnonymousGroupMessage.fields, true, false),
    qqWalletMsg: ProtoField(24, () => QQWalletMsg.fields, true, false),
    customElem: ProtoField(31, () => CustomElem.fields, true, false),
    generalFlags: ProtoField(37, () => GeneralFlags.fields, true, false),
    srcMsg: ProtoField(45, () => SrcMsg.fields, true, false),
    lightAppElem: ProtoField(51, () => LightAppElem.fields, true, false),
    commonElem: ProtoField(53, () => CommonElem.fields, true, false),
});