import { WireType } from './WireType';

export class CodedReader {
    private buffer: Buffer;
    private offset: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    readByte(): number {
        return this.buffer[this.offset++];
    }

    readBytes(length: number): Buffer {
        const bytes = this.buffer.subarray(this.offset, this.offset + length);
        this.offset += length;
        return bytes;
    }

    readVarint(): number {
        let result = 0;
        let shift = 0;
        while (true) {
            const byte = this.readByte();
            result |= (byte & 0x7F) << shift;
            if ((byte & 0x80) === 0) {
                break;
            }
            shift += 7;
        }
        return result >>> 0; // Convert to unsigned
    }

    readVarintToBigint(): bigint {
        let result = BigInt(0);
        let shift = BigInt(0);
        while (true) {
            const byte = BigInt(this.readByte());
            result |= (byte & BigInt(0x7F)) << shift;
            if ((byte & BigInt(0x80)) === BigInt(0)) {
                break;
            }
            shift += BigInt(7);
        }
        return result;
    }

    readFixed32(): number {
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value >>> 0; // Convert to unsigned
    }

    readFixed64(): bigint {
        const low = this.readFixed32();
        const high = this.readFixed32();
        return BigInt(low) | (BigInt(high) << BigInt(32));
    }

    readFloat(): number {
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }

    readDouble(): number {
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
    }

    readTag(): { fieldNumber: number; wireType: WireType } {
        const tag = this.readVarint();
        return {
            fieldNumber: tag >>> 3,
            wireType: tag & 0x07,
        };
    }

    hasNext(): boolean {
        return this.offset < this.buffer.length;
    }
}

export function zigzagDecode32(n: number): number {
    return (n >>> 1) ^ -(n & 1);
}

export function zigzagDecode64(n: bigint): bigint {
    return (n >> BigInt(1)) ^ -(n & BigInt(1));
}
