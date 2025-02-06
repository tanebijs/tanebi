import { MessageElementDecoded } from '@/message';
import { textBuilder } from '@/message/outgoing/segment/text';

export interface OutgoingSegmentBuilder<T extends string, S> {
    segmentType: T;
    build(segment: S): MessageElementDecoded;
}

export function defineOutgoing<T extends string, S>(
    segmentType: T,
    build: OutgoingSegmentBuilder<T, S>['build']
): OutgoingSegmentBuilder<T, S> {
    return { segmentType, build };
}

type ConstructInputType<P> =
    P extends OutgoingSegmentBuilder<infer T, infer S> ? { type: T } & S : never;

export class OutgoingSegmentCollection<T extends OutgoingSegmentBuilder<string, unknown>[]
> {
    private builderMap;

    constructor(builders: T) {
        this.builderMap = Object.fromEntries(
            builders.map(builder => [builder.segmentType, builder])
        );
    }

    build(segment: ConstructInputType<T[number]>): MessageElementDecoded | undefined {
        const builder = this.builderMap[segment.type];
        if (builder) {
            return builder.build(segment);
        }
    }
}

export const outgoingSegments = new OutgoingSegmentCollection([
    textBuilder,
]);