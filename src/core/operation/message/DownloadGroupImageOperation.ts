import { defineOperation } from '@/core/operation/OperationBase';
import { DownloadGroupImage, DownloadGroupImageResponse } from '@/core/packet/oidb/0x11c4_200';
import { IndexNode } from '@/core/packet/oidb/media/IndexNode';

export const DownloadGroupImageOperation = defineOperation(
    'downloadGroupImage',
    'OidbSvcTrpcTcp.0x11c4_200',
    (ctx, groupUin: number, node: ReturnType<typeof IndexNode.decode>) => Buffer.from(DownloadGroupImage.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 1,
                sceneType: 2,
                groupExt: { groupUin },
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
        const response = DownloadGroupImageResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);