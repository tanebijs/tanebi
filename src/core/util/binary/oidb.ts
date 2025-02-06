import { OidbBase } from '@/core/packet/oidb';
import { MessageProtoFieldType, NapProtoDecodeStructType, NapProtoEncodeStructType, NapProtoMsg, ScalarProtoFieldType, ScalarType } from '@napneko/nap-proto-core';

// Types that are not exported by nap-proto-core
type ProtoMessageType = {
    [key: string]: ProtoFieldType;
};
type ProtoFieldType = ScalarProtoFieldType<ScalarType, boolean, boolean> | MessageProtoFieldType<() => ProtoMessageType, boolean, boolean>;

export class OidbSvcPacket<const T extends ProtoMessageType> {
    private readonly bodyProto: NapProtoMsg<T>;
    
    constructor(
        public readonly command: number,
        public readonly subCommand: number,
        bodyFields: T,
        public readonly addLafter: boolean = false,
        public readonly isUid: boolean = false,
    ) {
        this.bodyProto = new NapProtoMsg(bodyFields);
    }

    encode(data: NapProtoEncodeStructType<T>): Uint8Array {
        return OidbBase.encode({
            command: this.command,
            subCommand: this.subCommand,
            body: this.bodyProto.encode(data),
            reserved: this.isUid ? 1 : 0,
            lafter: this.addLafter ? {} : undefined,
            properties: [],
        });
    }

    decode(data: Uint8Array): Omit<typeof OidbBase.decode, 'body'> & { body?: NapProtoDecodeStructType<T> } {
        const decoded = OidbBase.decode(data);
        return {
            ...decoded,
            body: decoded.body && this.bodyProto.decode(decoded.body),
        };
    }
}