import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchFaceDetails, FetchFaceDetailsResponse } from '@/internal/packet/oidb/0x9154_1';

export const FetchFaceDetailsOperation = defineOperation(
    'fetchFaceDetails',
    'OidbSvcTrpcTcp.0x9154_1',
    () => Buffer.from(FetchFaceDetails.encode({
        field1: 0,
        field2: 7,
        field3: '0',
    })),
    (ctx, payload) => FetchFaceDetailsResponse.decodeBodyOrThrow(payload),
);