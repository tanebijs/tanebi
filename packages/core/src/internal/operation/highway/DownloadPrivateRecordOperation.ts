import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadPrivateRecord, DownloadPrivateRecordResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';

export const DownloadPrivateRecordOperation = defineOperation(
    'downloadPrivateRecord',
    'OidbSvcTrpcTcp.0x126d_200',
    (ctx, senderUid: string, node: NapProtoDecodeStructType<typeof IndexNode.fields>) => Buffer.from(DownloadPrivateRecord.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 1,
                businessType: 3,
                sceneType: 1,
                c2CExt: {
                    accountType: 2,
                    uid: senderUid,
                }
            },
            client: { agentType: 2 },
        },
        download: { node }
    })),
    (ctx, payload) => {
        const response = DownloadPrivateRecordResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);