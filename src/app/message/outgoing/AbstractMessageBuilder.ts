import { OutgoingSegment, BotContact } from '@/app/entity';
import { OutgoingMessage } from '@/core/message/outgoing';

export abstract class AbstractMessageBuilder {
    protected segments: OutgoingSegment[] = [];
    protected repliedSequence?: number;

    constructor(readonly contact: BotContact) { }

    /**
     * Append a text segment to the message
     */
    text(content: string) {
        this.segments.push({ type: 'text', content });
    }

    /**
     * Set this message as a reply to another message
     * @param sequence The sequence number of the message to reply to
     */
    reply(sequence: number) {
        this.repliedSequence = sequence;
    }

    /**
     * Append an image segment to the message
     * @param data The image data
     */
    abstract image(data: Uint8Array): Promise<void>;

    /**
     * Build the message
     */
    abstract build(): OutgoingMessage;
}
