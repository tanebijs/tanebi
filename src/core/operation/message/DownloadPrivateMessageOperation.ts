import { defineOperation } from '@/core/operation/OperationBase';
import { DownloadPrivateImage, DownloadPrivateImageResponse } from '@/core/packet/oidb/0x11c5_200';
import { IndexNode } from '@/core/packet/oidb/media/IndexNode';

export const DownloadPrivateImageOperation = defineOperation(
    'downloadPrivateImage',
    'OidbSvcTrpcTcp.0x11c5_200',
    (ctx, targetUid: string, node: ReturnType<typeof IndexNode.decode>) => Buffer.from(DownloadPrivateImage.encode({
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
                    targetUid,
                }
            },
            client: { agentType: 2 },
        },
        download: {
            node,
            download: {
                video: {
                    busiType: 0,
                    sceneType: 0,
                },
            },
        },
    })),
    (ctx, payload) => {
        const response = DownloadPrivateImageResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);