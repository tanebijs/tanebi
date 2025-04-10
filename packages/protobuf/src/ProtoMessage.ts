import { CodedWriter } from './CodedWriter';
import { InferProtoSpec, InferProtoSpecInput, kTag, kTagLength, ProtoFieldType, ProtoSpec } from './ProtoField';
import { ProtoSerializer, ScalarSerializerCompiler } from './ProtoSerializer';
import { ScalarSizeCalculatorCompiler, SizeCalculator, SizeOf } from './SizeOf';

export interface ProtoModel {
    [Key: string]: ProtoSpec<ProtoFieldType, boolean, boolean>;
}

export type InferProtoModel<T extends ProtoModel> = {
    [Key in keyof T]: InferProtoSpec<T[Key]>;
};

export type InferProtoModelInput<T extends ProtoModel> = Partial<{
    [Key in keyof T]: InferProtoSpecInput<T[Key]>;
}>;

export class ProtoMessage<const T extends ProtoModel> {
    private static compiledMessages = new WeakMap<ProtoModel, ProtoMessage<ProtoModel>>();

    private readonly fieldSizeCalculators = new Map<string, SizeCalculator>();
    private readonly fieldSerializers = new Map<string, ProtoSerializer>();
    private constructor(readonly fields: T) {
        for (const key in fields) {
            const spec = fields[key];
            const type = spec.type;
            if (typeof type === 'function') {
                let lazyLoadModel: ProtoModel | undefined;
                function lazyLoad() {
                    if (lazyLoadModel === undefined) {
                        lazyLoadModel = (<() => ProtoModel>type)();
                    }
                    return lazyLoadModel;
                }
                if (spec.repeated) {
                    this.fieldSizeCalculators.set(key, (data, cache) => {
                        let size = spec[kTagLength] * data.length;
                        const message = ProtoMessage.of(lazyLoad());
                        for (const item of data) {
                            const bodySize = message.calculateSerializedSize(item, cache);
                            cache.set(item, bodySize);
                            size += SizeOf.varint32(bodySize) + bodySize;
                        }
                        return size;
                    });
                    this.fieldSerializers.set(key, (data, writer, cache) => {
                        const message = ProtoMessage.of(lazyLoad());
                        for (const item of data) {
                            const bodySize = cache.get(item)!;
                            writer.writeVarint(spec[kTag]);
                            writer.writeVarint(bodySize);
                            message.write(item, writer, cache);
                        }
                    });
                } else {
                    this.fieldSizeCalculators.set(key, (data, cache) => {
                        const message = ProtoMessage.of(lazyLoad());
                        const bodySize = message.calculateSerializedSize(data, cache);
                        return spec[kTagLength] + SizeOf.varint32(bodySize) + bodySize;
                    });
                    this.fieldSerializers.set(key, (data, writer, cache) => {
                        const message = ProtoMessage.of(lazyLoad());
                        const bodySize = cache.get(data)!;
                        writer.writeVarint(spec[kTag]);
                        writer.writeVarint(bodySize);
                        message.write(data, writer, cache);
                    });
                }
            } else {
                this.fieldSizeCalculators.set(key, ScalarSizeCalculatorCompiler[type](spec));
                this.fieldSerializers.set(key, ScalarSerializerCompiler[type](spec));
            }
        }
    }

    private calculateSerializedSize(message: InferProtoModelInput<T>, cache: WeakMap<object, number>): number {
        let size = 0;
        for (const key in message) {
            const value = message[key];
            if (value === undefined) {
                continue;
            }
            const calculator = this.fieldSizeCalculators.get(key)!;
            const addSize = calculator(value, cache);
            size += addSize;
        }
        cache.set(message, size);
        return size;
    }

    private write(message: InferProtoModelInput<T>, writer: CodedWriter, cache: WeakMap<object, number>) {
        for (const key in message) {
            const value = message[key];
            if (value === undefined) {
                continue;
            }
            const serializer = this.fieldSerializers.get(key)!;
            serializer(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value,
                writer,
                cache
            );
        }
    }

    encode(message: InferProtoModelInput<T>): Buffer {
        const cache = new WeakMap<object, number>();
        const size = this.calculateSerializedSize(message, cache);
        const writer = new CodedWriter(size);
        this.write(message, writer, cache);
        return writer.build();
    }

    static of<const T extends ProtoModel>(model: T): ProtoMessage<T> {
        let message = this.compiledMessages.get(model);
        if (message === undefined) {
            message = new ProtoMessage(model);
            this.compiledMessages.set(model, message);
        }
        return message as ProtoMessage<T>;
    }
}
