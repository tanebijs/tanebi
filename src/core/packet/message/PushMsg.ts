import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { NTSysEvent } from '@/core/packet/common/NTSysEvent';
import { MessageContentHead } from '@/core/packet/message/MessageContentHead';
import { MessageBody } from '@/core/packet/message/MessageBody';

export const PushMsg = new NapProtoMsg({
    message: ProtoField(1, () => PushMsgBody.fields),
    status: ProtoField(3, ScalarType.INT32, true),
    ntEvent: ProtoField(4, () => NTSysEvent.fields, true),
    pingFlag: ProtoField(5, ScalarType.INT32, true),
    generalFlag: ProtoField(9, ScalarType.INT32, true),
});

export const PushMsgBody = new NapProtoMsg({
    responseHead: ProtoField(1, () => ({
        fromUin: ProtoField(1, ScalarType.UINT32),
        fromUid: ProtoField(2, ScalarType.STRING, true),
        type: ProtoField(3, ScalarType.UINT32),
        sigMap: ProtoField(4, ScalarType.UINT32),
        toUin: ProtoField(5, ScalarType.UINT32),
        toUid: ProtoField(6, ScalarType.STRING, true),
        friendExt: ProtoField(7, () => ({
            friendName: ProtoField(6, ScalarType.STRING, true)
        }), true),
        groupExt: ProtoField(8, () => ({
            groupUint: ProtoField(1, ScalarType.UINT32),
            memberName: ProtoField(4, ScalarType.STRING),
            unknown5: ProtoField(5, ScalarType.UINT32),
            groupName: ProtoField(7, ScalarType.STRING),
        }), true),
    })),
    contentHead: ProtoField(2, () => MessageContentHead.fields),
    body: ProtoField(3, () => MessageBody.fields, true),
});