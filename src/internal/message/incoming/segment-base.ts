import { MessageElementDecoded } from '@/internal/message';

export type ElementField = keyof MessageElementDecoded;

export interface IncomingElementParser<
    F extends ElementField,
    T extends string, O
> {
    acceptsField: F,
    segmentType: T,
    tryParse(element: Exclude<MessageElementDecoded[F], undefined>): O | undefined,
}

export function defineIncoming<
    const F extends ElementField,
    const T extends string,
    const O
>(
    acceptsField: F, 
    segmentType: T,
    tryParse: IncomingElementParser<F, T, O>['tryParse']
): IncomingElementParser<F, T, O> {
    return { acceptsField, segmentType, tryParse };
}

type ConstructReturnType<P> =
    P extends IncomingElementParser<ElementField, infer T, infer O> ? { type: T } & O : never;

export class IncomingSegmentCollection<
    const T extends IncomingElementParser<ElementField, string, unknown>[]
> {
    constructor(public readonly parsers: T) {}

    parse(element: MessageElementDecoded): ConstructReturnType<T[number]> | undefined {
        for (const parser of this.parsers) {
            const value = element[parser.acceptsField];
            if (value) {
                const segment = parser.tryParse(value);
                if (segment) {
                    return { type: parser.segmentType, ...segment } as ConstructReturnType<T[number]>;
                }
            }
        }
    }
}