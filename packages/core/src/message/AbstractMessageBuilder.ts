import { OutgoingSegment } from '@/entity';
import { Bot, faceCache, log } from '@/index';
import { OutgoingMessage } from '@/internal/message/outgoing';

export abstract class AbstractMessageBuilder {
    protected segments: OutgoingSegment[] = [];

    protected constructor(protected readonly bot: Bot) { }

    /**
     * Append a text segment to the message
     */
    text(content: string) {
        this.segments.push({ type: 'text', content });
    }

    /**
     * Append a face segment to the message
     */
    face(faceId: number): void;
    face(faceId: string): void;
    face(faceId: number | string) {
        const stringFaceId = typeof faceId === 'string' ? faceId : String(faceId);
        const numberFaceId = typeof faceId === 'number' ? faceId : parseInt(faceId);
        const detail = this.bot[faceCache].get(stringFaceId);
        if (!detail) {
            this.bot[log].emit('warning', 'AbstractMessageBuilder.face', `Unknown face ID: ${faceId}`);
            return;
        }
        if (detail.aniStickerPackId) { // Is large face
            this.segments.push({
                type: 'face',
                largeFaceInfo: {
                    aniStickerPackId: String(detail.aniStickerPackId),
                    aniStickerId: String(detail.aniStickerId),
                    faceId: numberFaceId,
                    field4: 1,
                    aniStickerType: detail.aniStickerType,
                    field6: '',
                    preview: detail.qDes,
                    field9: 1,
                }
            });
            return;
        }
        
        if (numberFaceId < 260) { // Is old face
            this.segments.push({
                type: 'face',
                oldFaceId: numberFaceId,
            });
            return;
        }

        this.segments.push({
            type: 'face',
            smallExtraFaceInfo: {
                faceId: numberFaceId,
                text1: '[666]',
                text2: '[666]',
            }
        });
    }

    /**
     * Append an image segment to the message
     */
    abstract image(data: Uint8Array): Promise<void>;

    /**
     * Append a record segment to the message
     */
    abstract record(data: Uint8Array, duration: number): Promise<void>;

    /**
     * Build the message
     */
    abstract build(clientSequence: number): OutgoingMessage;
}
