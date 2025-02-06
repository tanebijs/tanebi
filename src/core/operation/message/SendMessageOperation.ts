import { defineOperation } from '@/core/operation/OperationBase';
import { PbSendMsg, PbSendMsgResponse } from '@/core/packet/message/PbSendMsg';
import { buildPbSendMsg, OutgoingMessage } from '@/message/outgoing';

export const SendMessageOperation = defineOperation(
    'sendMessage',
    'MessageSvc.PbSendMsg',
    (ctx, params: OutgoingMessage) => Buffer.from(PbSendMsg.encode(buildPbSendMsg(ctx, params))),
    (ctx, payload) => {
        const response = PbSendMsgResponse.decode(payload);
        if (response.resultCode !== 0) {
            throw new Error(`Failed to send message: ${response.errMsg}`);
        } else {
            return {
                sequence: response.groupSequence ?? response.privateSequence,
                timestamp: response.timestamp1,
            };
        }
    }
);