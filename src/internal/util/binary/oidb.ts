import { OidbBase } from '@/internal/packet/oidb';
import { NapProtoEncodeStructType, NapProtoMsg, ProtoMessageType } from '@napneko/nap-proto-core';

export class OidbSvcContract<const T extends ProtoMessageType> {
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

    tryDecode(data: Uint8Array) {
        const decoded = OidbBase.decode(data);
        return {
            ...decoded,
            body: decoded.body ? this.bodyProto.decode(decoded.body) : undefined,
        };
    }

    decodeBodyOrThrow(data: Uint8Array) {
        const decoded = this.tryDecode(data);
        if (decoded.errorCode !== 0 || !decoded.body) {
            throw new Error(`Failed to decode OidbSvcTrpcTcp0x${this.command.toString(16)}_${this.subCommand} response (${decoded.errorCode}): ${decoded.errorMsg}`);
        }
        return decoded.body;
    }
}