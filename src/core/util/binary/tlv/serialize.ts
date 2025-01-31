export type TlvScalarFieldType =
    | 'uint8'
    | 'uint16'
    | 'uint32'
    | 'uint64'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'float'
    | 'double';
export type TlvVariableFieldType = 'bytes' | 'string';
export type TlvFieldType = TlvScalarFieldType | TlvVariableFieldType | 'fixed-bytes';

export type LengthPrefixType = 'none' | 'uint8' | 'uint16' | 'uint32';
export type TlvFieldSpec<K extends string, T extends TlvFieldType> =
    T extends 'fixed-bytes' ? {
        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * 'fixed-bytes'
         */
        type: T;

        /**
         * Fixed length of the field
         */
        length: number;
    } : T extends TlvVariableFieldType ? {
        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
         * 'float', 'double', 'bytes', 'string'
         */
        type: T;

        /**
         * Length prefix type, one of 'none', 'uint8', 'uint16', 'uint32'
         */
        lengthPrefix: LengthPrefixType;

        /**
         * Whether the length includes the prefix itself.
         * For example, if the length prefix is 'uint8' and this is true, the length field will be the length of the
         * data plus 1.
         */
        lengthIncludesPrefix: boolean;
    } : {

        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
         * 'float', 'double', 'bytes', 'string'
         */
        type: T;
    }

export type TlvPacketSchema = readonly TlvFieldSpec<string, TlvFieldType>[];
type ParseTlvScalarType<T extends TlvFieldType> =
    T extends 'uint8' | 'int8' | 'uint16' | 'int16' | 'uint32' | 'int32' | 'float' | 'double' ? number :
        T extends 'int64' | 'uint64' ? bigint :
            T extends 'fixed-bytes' | 'bytes' ? Buffer :
                T extends 'string' ? string :
                    never;
type ExtractName<T> = T extends TlvFieldSpec<infer K, TlvFieldType> ? K : never;
type ExtractType<T> = T extends TlvFieldSpec<string, infer K> ? ParseTlvScalarType<K> : never;
export type Deserialized<T extends TlvPacketSchema> =
    { [S in T[number] as ExtractName<S>]: ExtractType<S> };

/**
 * Create a TLV field specification.
 * @param name Field name
 * @param type Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
 * 'float', 'double'
 * @constructor
 */
export function TlvScalarField<
    K extends string,
    T extends TlvScalarFieldType
>(name: K, type: T): TlvFieldSpec<K, T> {
    return { name, type } as TlvFieldSpec<K, T>;
}

/**
 * Create a TLV field specification for variable-length fields.
 * @param name Field name
 * @param type Field type, one of 'bytes', 'string'
 * @param lengthPrefix Length prefix type, one of 'none', 'uint8', 'uint16', 'uint32'
 * @param lengthIncludesPrefix Whether the length includes the prefix itself
 * @constructor
 */
export function TlvVariableField<
    K extends string,
    T extends TlvVariableFieldType
>(name: K, type: T, lengthPrefix: LengthPrefixType, lengthIncludesPrefix: boolean): TlvFieldSpec<K, T> {
    return { name, type, lengthPrefix, lengthIncludesPrefix } as TlvFieldSpec<K, T>;
}

/**
 * Create a TLV field specification for fixed-length fields.
 * @param name Field name
 * @param length Length of the field
 * @constructor
 */
export function TlvFixedBytesField<K extends string>(name: K, length: number): TlvFieldSpec<K, 'fixed-bytes'> {
    return { name, type: 'fixed-bytes', length } as TlvFieldSpec<K, 'fixed-bytes'>;
}

const serializers: {
    [K in TlvFieldType]: (value: ParseTlvScalarType<K>, spec: TlvFieldSpec<string, K>) => Buffer;
} = {
    int8(value) {
        const buffer = Buffer.alloc(1);
        buffer.writeInt8(value, 0);
        return buffer;
    },

    uint8(value) {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(value, 0);
        return buffer;
    },

    int16(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeInt16BE(value, 0);
        return buffer;
    },

    uint16(value) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(value, 0);
        return buffer;
    },

    int32(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(value, 0);
        return buffer;
    },

    uint32(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(value, 0);
        return buffer;
    },

    int64(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(value, 0);
        return buffer;
    },

    uint64(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(value, 0);
        return buffer;
    },

    float(value) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatBE(value, 0);
        return buffer;
    },

    double(value) {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleBE(value, 0);
        return buffer;
    },

    bytes(value, spec) {
        const length = value.length;
        if (spec.lengthPrefix === 'uint8') {
            const buffer = Buffer.alloc(1 + length);
            buffer.writeUInt8(spec.lengthIncludesPrefix ? length + 1 : length, 0);
            value.copy(buffer, 1);
            return buffer;
        } else if (spec.lengthPrefix === 'uint16') {
            const buffer = Buffer.alloc(2 + length);
            buffer.writeUInt16BE(spec.lengthIncludesPrefix ? length + 2 : length, 0);
            value.copy(buffer, 2);
            return buffer;
        } else if (spec.lengthPrefix === 'uint32') {
            const buffer = Buffer.alloc(4 + length);
            buffer.writeUInt32BE(spec.lengthIncludesPrefix ? length + 4 : length, 0);
            value.copy(buffer, 4);
            return buffer;
        } else {
            return value;
        }
    },

    string(value, spec) {
        return this.bytes(Buffer.from(value, 'utf8'), {
            name: spec.name,
            type: 'bytes',
            lengthPrefix: spec.lengthPrefix,
            lengthIncludesPrefix: spec.lengthIncludesPrefix,
        });
    },

    'fixed-bytes'(value, spec) {
        if (value.length !== spec.length) {
            throw new Error(`Fixed-length field ${spec.name} must have length ${spec.length}`);
        }
        return value;
    },
};

/**
 * Serialize a TLV packet.
 * @param schema TLV schema
 * @param data Data to serialize
 */
export function encodeTlv<const T extends TlvPacketSchema>(schema: T, data: Deserialized<T>): Buffer {
    return Buffer.concat(schema.map(field => {
        const name = field.name;
        // eslint-disable-next-line
        // @ts-ignore
        const value = data[name];
        const type = field.type;
        // eslint-disable-next-line
        // @ts-ignore
        return serializers[type](value, field as TlvFieldSpec<string, TlvFieldType>);
    }));
}

const deserializers: {
    [K in TlvFieldType]: (buffer: Buffer, offset: number, spec: TlvFieldSpec<string, K>) => [ParseTlvScalarType<K>, number];
} = {
    int8(buffer, offset) {
        return [buffer.readInt8(offset), offset + 1];
    },

    uint8(buffer, offset) {
        return [buffer.readUInt8(offset), offset + 1];
    },

    int16(buffer, offset) {
        return [buffer.readInt16BE(offset), offset + 2];
    },

    uint16(buffer, offset) {
        return [buffer.readUInt16BE(offset), offset + 2];
    },

    int32(buffer, offset) {
        return [buffer.readInt32BE(offset), offset + 4];
    },

    uint32(buffer, offset) {
        return [buffer.readUInt32BE(offset), offset + 4];
    },

    int64(buffer, offset) {
        return [buffer.readBigInt64BE(offset), offset + 8];
    },

    uint64(buffer, offset) {
        return [buffer.readBigUInt64BE(offset), offset + 8];
    },

    float(buffer, offset) {
        return [buffer.readFloatBE(offset), offset + 4];
    },

    double(buffer, offset) {
        return [buffer.readDoubleBE(offset), offset + 8];
    },

    bytes(buffer, offset, spec) {
        let length: number;
        if (spec.lengthPrefix === 'uint8') {
            length = buffer.readUInt8(offset);
            if (spec.lengthIncludesPrefix) length -= 1;
            offset += 1;
        } else if (spec.lengthPrefix === 'uint16') {
            length = buffer.readUInt16BE(offset);
            if (spec.lengthIncludesPrefix) length -= 2;
            offset += 2;
        } else if (spec.lengthPrefix === 'uint32') {
            length = buffer.readUInt32BE(offset);
            if (spec.lengthIncludesPrefix) length -= 4;
            offset += 4;
        } else {
            length = buffer.length - offset; // read until the end of the buffer
        }
        return [buffer.subarray(offset, offset + length), offset + length];
    },

    string(buffer, offset, spec) {
        const [value, newOffset] = this.bytes(buffer, offset, {
            name: spec.name,
            type: 'bytes',
            lengthPrefix: spec.lengthPrefix,
            lengthIncludesPrefix: spec.lengthIncludesPrefix,
        });
        return [value.toString('utf8'), newOffset];
    },

    'fixed-bytes'(buffer, offset, spec) {
        return [buffer.subarray(offset, offset + spec.length), offset + spec.length];
    },
};

/**
 * Deserialize a TLV packet.
 * @param schema TLV schema
 * @param buffer Buffer to deserialize
 */
export function decodeTlv<const T extends TlvPacketSchema>(schema: T, buffer: Buffer): Deserialized<T> {
    // If 'none' is used, it must be the last field
    for (let i = 0; i < schema.length - 1; i++) {
        const field = schema[i];
        if (field.type === 'bytes' || field.type === 'string') {
            if (field.lengthPrefix === 'none') {
                throw new Error(`Field ${field.name} has length prefix 'none' but is not the last field`);
            }
        }
    }

    const data: Record<string, unknown> = {};
    let offset = 0;
    for (const field of schema) {
        const name = field.name;
        const [value, newOffset] = deserializers[field.type](
            buffer,
            offset,
            // eslint-disable-next-line
            // @ts-ignore
            field,
        );
        data[name] = value;
        offset = newOffset;
    }
    return data as Deserialized<T>;
}

