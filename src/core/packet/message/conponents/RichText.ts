import { NapProtoMsg, ProtoField } from '@napneko/nap-proto-core';
import { MessageElement } from '@/core/packet/message/conponents/MessageElement';

export const RichText = new NapProtoMsg({
    // attribute: ProtoField(1, () => Attribute.fields, true),
    elements: ProtoField(2, () => MessageElement.fields, false, true),
    // notOnlineFile: ProtoField(3, () => NotOnlineFile.fields, true),
    // ptt: ProtoField(4, () => Ptt.fields, true),
});