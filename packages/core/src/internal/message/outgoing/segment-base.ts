import { MessageElementEncoded } from '@/internal/message';
import { OutgoingMessage } from '@/internal/message/outgoing';

export interface OutgoingSegmentBuilder<T extends string, S> {
    segmentType: T;
    build(segment: S, msg: OutgoingMessage): MessageElementEncoded | MessageElementEncoded[] | undefined;
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

    build(segment: ConstructInputType<T[number]>, msg: OutgoingMessage): MessageElementEncoded[] {
        const builder = this.builderMap[segment.type];
        if (builder) {
            const buildResult = builder.build(segment, msg);
            if (Array.isArray(buildResult)) {
                return buildResult;
            } else if (buildResult) {
                return [buildResult];
            }
        }
        return [];
    }
}