import { MessageBody } from '@/core/packet/message/MessageBody';
import { MessageContentHead } from '@/core/packet/message/MessageContentHead';
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const PbSendMsg = new NapProtoMsg({
    routingHead: ProtoField(1, () => ({
        c2CExt: ProtoField(1, () => ({
            uin: ProtoField(1, ScalarType.UINT32, true, false),
            uid: ProtoField(2, ScalarType.STRING, true, false),
            field3: ProtoField(3, ScalarType.UINT32, true, false),
            sig: ProtoField(4, ScalarType.UINT32, true, false),
            receiverUin: ProtoField(5, ScalarType.UINT32, true, false),
            receiverUid: ProtoField(6, ScalarType.STRING, true, false),
        }), true, false),
        groupExt: ProtoField(2, () => ({
            groupCode: ProtoField(1, ScalarType.UINT32, true, false),
        }), true, false),
        groupTemp: ProtoField(3, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32, true, false),
            toUin: ProtoField(2, ScalarType.UINT32, true, false),
        }), true, false),
        wpaTmp: ProtoField(6, () => ({
            toUin: ProtoField(1, ScalarType.UINT64, false, false),
            sig: ProtoField(2, ScalarType.BYTES, true, false),
        }), true, false),
        trans0X211: ProtoField(15, () => ({
            toUin: ProtoField(1, ScalarType.UINT64, true, false),
            ccCmd: ProtoField(2, ScalarType.UINT32, true, false),
            uid: ProtoField(8, ScalarType.STRING, true, false),
        }), true, false),
    }), true, false),
    contentHead: ProtoField(2, () => MessageContentHead.fields, true, false),
    body: ProtoField(3, () => MessageBody.fields, true, false),
    clientSequence: ProtoField(4, ScalarType.UINT32, true, false),
    random: ProtoField(5, ScalarType.UINT32, true, false),
    syncCookie: ProtoField(6, ScalarType.BYTES, true, false),
    via: ProtoField(8, ScalarType.UINT32, true, false),
    dataStatist: ProtoField(9, ScalarType.UINT32, true, false),
    control: ProtoField(12, () => ({
        msgFlag: ProtoField(1, ScalarType.SINT32, false, false),
    }), true, false),
    multiSendSeq: ProtoField(14, ScalarType.UINT32, false, false),
});