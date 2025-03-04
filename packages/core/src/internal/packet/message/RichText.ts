import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';
import { MessageElement } from '@/internal/packet/message/MessageElement';
import { Attribute } from '@/internal/packet/message/Attribute';
import { NotOnlineFile } from '@/internal/packet/message/NotOnlineFile';
import { Ptt } from '@/internal/packet/message/Ptt';

export const RichText = new NapProtoMsg({
    attribute: ProtoField(1, () => Attribute.fields, true),
    elements: ProtoField(2, () => MessageElement.fields, false, true),
    notOnlineFile: ProtoField(3, () => NotOnlineFile.fields, true),
    ptt: ProtoField(4, () => Ptt.fields, true),
});