import { PushMsgBody, PushMsgType } from '@/core/packet/message/PushMsg';
import { MessageChain, MessageType } from '@/message';

export function parseMetadata(pushMsg: ReturnType<typeof PushMsgBody.decode>): MessageChain {
    if (!pushMsg.responseHead.groupExt) {
        return {
            type: MessageType.PrivateMessage,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            targetUid: pushMsg.responseHead.toUid,
            sequence: pushMsg.contentHead.ntMsgSeq ?? 0,
            segments: [],
            internalElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,

            clientSequence: pushMsg.contentHead.sequence ?? 0,
            isTemporary: pushMsg.contentHead.type === PushMsgType.TempMessage,
        };
    } else {
        return {
            type: MessageType.GroupMessage,

            groupUin: pushMsg.responseHead.groupExt.groupUin,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            sequence: pushMsg.contentHead.sequence ?? 0,
            segments: [],
            internalElems: pushMsg.body?.richText?.elements ?? [],
            msgUid: pushMsg.contentHead.msgUid,
        };
    }
}