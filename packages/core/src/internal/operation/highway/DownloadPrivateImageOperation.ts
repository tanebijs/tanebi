import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadPrivateImage, DownloadPrivateImageResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { NapProtoDecodeStructType } from '@napneko/nap-proto-core';

export const DownloadPrivateImageOperation = defineOperation(
    'downloadPrivateImage',
    'OidbSvcTrpcTcp.0x11c5_200',
    (ctx, senderUid: string, node: NapProtoDecodeStructType<typeof IndexNode.fields>) => Buffer.from(DownloadPrivateImage.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 1,
                sceneType: 1,
                c2CExt: {
                    accountType: 2,
                    uid: senderUid,
                }
            },
            client: { agentType: 2 },
        },
        download: { node },
    })),
    (ctx, payload) => {
        const response = DownloadPrivateImageResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);