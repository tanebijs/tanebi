import { BotContact, OutgoingSegment } from '@/app/entity';
import { OutgoingMessage } from '@/core/message/outgoing';

export abstract class OutgoingMessageBuilder {
    protected segments: OutgoingSegment[] = [];

    constructor(readonly contact: BotContact) {}

    text(content: string) {
        this.segments.push({ type: 'text', content });
    }

    abstract image(data: Uint8Array): Promise<void>;

    abstract build(): OutgoingMessage;
}

export * from './GroupMessageBuilder';