import { Converter } from './Converter';
import { InferProtoModel, InferProtoModelInput, ProtoModel } from './ProtoMessage';
import { ScalarType } from './ScalarType';
import { WireType } from './WireType';

export type Supplier<T> = () => T;
export type ProtoFieldType = ScalarType | Supplier<ProtoModel>;

export const kTag = Symbol('Cached Tag');

export interface ProtoSpec<
    T extends ProtoFieldType,
    O extends boolean, // optional
    R extends boolean // repeated
> {
    fieldNumber: number;
    type: T;
    optional: O;
    repeated: R;
    packed?: boolean;
    [kTag]: number;
}

export type InferProtoSpec<Spec> = Spec extends ProtoSpec<infer T, infer O, infer R>
    ? R extends true
        ? O extends true
            ? never
            : Array<InferProtoSpec<ProtoSpec<T, O, false>>>
        : O extends true
        ? InferProtoSpec<ProtoSpec<T, false, false>> | undefined
        : T extends ScalarType
        ? ScalarTypeToTsType<T>
        : T extends Supplier<infer S extends ProtoModel>
        ? InferProtoModel<S>
        : never
    : never;

export type InferProtoSpecInput<Spec> = Spec extends ProtoSpec<infer T, infer O, infer R>
    ? R extends true
        ? O extends true
            ? never
            : Array<InferProtoSpecInput<ProtoSpec<T, O, false>>>
        : T extends ScalarType
        ? ScalarTypeToTsType<T> | undefined
        : T extends Supplier<infer S extends ProtoModel>
        ? InferProtoModelInput<S> | undefined
        : never
    : never;

export type ScalarTypeToTsType<T extends ScalarType> = T extends
    | ScalarType.DOUBLE
    | ScalarType.FLOAT
    | ScalarType.INT32
    | ScalarType.FIXED32
    | ScalarType.UINT32
    | ScalarType.SFIXED32
    | ScalarType.SINT32
    ? number
    : T extends ScalarType.INT64 | ScalarType.UINT64 | ScalarType.FIXED64 | ScalarType.SFIXED64 | ScalarType.SINT64
    ? bigint
    : T extends ScalarType.BOOL
    ? boolean
    : T extends ScalarType.STRING
    ? string
    : T extends ScalarType.BYTES
    ? Uint8Array
    : never;

const ScalarTypeToWireType: {
    [K in ScalarType]: WireType;
} = {
    [ScalarType.DOUBLE]: WireType.Fixed64,
    [ScalarType.FLOAT]: WireType.Fixed32,
    [ScalarType.INT64]: WireType.Varint,
    [ScalarType.UINT64]: WireType.Varint,
    [ScalarType.INT32]: WireType.Varint,
    [ScalarType.FIXED64]: WireType.Fixed64,
    [ScalarType.FIXED32]: WireType.Fixed32,
    [ScalarType.BOOL]: WireType.Varint,
    [ScalarType.STRING]: WireType.LengthDelimited,
    [ScalarType.BYTES]: WireType.LengthDelimited,
    [ScalarType.UINT32]: WireType.Varint,
    [ScalarType.SFIXED32]: WireType.Fixed32,
    [ScalarType.SFIXED64]: WireType.Fixed64,
    [ScalarType.SINT32]: WireType.Varint,
    [ScalarType.SINT64]: WireType.Varint,
};

export function ProtoField<T extends ProtoFieldType, O extends boolean, R extends boolean>(
    fieldNumber: number,
    type: T,
    optional: O,
    repeated: R,
    packed?: boolean
): ProtoSpec<T, O, R> {
    if (packed && (
        typeof type === 'function' ||
        type === ScalarType.STRING || type === ScalarType.BYTES
    )) {
        throw new Error('Packed fields must be of scalar type');
    }

    if (repeated && optional) {
        throw new Error('Repeated fields cannot be optional');
    }

    return {
        fieldNumber, type, optional, repeated, packed,
        [kTag]: Converter.tag(
            fieldNumber,
            typeof type === 'function' ? WireType.LengthDelimited :
                packed ? WireType.LengthDelimited : ScalarTypeToWireType[type]
        )
    };
}
