import { IncomingSegmentOf } from '@/core/message/incoming';

export class BotMsgImage {
    private constructor(public readonly url: string) {} // TODO: add other metadata

    static async create(data: IncomingSegmentOf<'image'>) {
        if (data.url) {
            return new BotMsgImage(data.url);
        }

        if (data.indexNode) {
            const resolved = ''; // TODO: resolve url;
            return new BotMsgImage(resolved);
        }

        throw new Error('Unexpected input data');
    }
}