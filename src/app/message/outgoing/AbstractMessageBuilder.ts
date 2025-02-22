import { OutgoingSegment, BotContact } from '@/app/entity';
import { OutgoingMessage } from '@/core/message/outgoing';

export abstract class AbstractMessageBuilder {
    protected segments: OutgoingSegment[] = [];
    protected repliedSequence?: number;

    constructor(readonly contact: BotContact) { }

    text(content: string) {
        this.segments.push({ type: 'text', content });
    }

    reply(sequence: number) {
        this.repliedSequence = sequence;
    }

    abstract image(data: Uint8Array): Promise<void>;

    abstract build(): OutgoingMessage;
}
