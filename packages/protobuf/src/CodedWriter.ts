import { WireType } from './WireType';

export class CodedWriter {
    private buffer: Buffer;
    private offset: number;

    constructor(size: number) {
        this.buffer = Buffer.allocUnsafe(size);
        this.offset = 0;
    }

    writeByte(value: number): void {
        this.buffer[this.offset++] = value;
    }

    writeBytes(bytes: Buffer): void {
        bytes.copy(this.buffer, this.offset);
        this.offset += bytes.length;
    }

    writeVarint(value: number): void {
        while (value > 0x7F) {
            this.writeByte((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        this.writeByte(value & 0x7F);
    }

    writeBigVarint(value: bigint): void {
        while (value > BigInt(0x7F)) {
            this.writeByte(Number((value & BigInt(0x7F)) | BigInt(0x80)));
            value >>= BigInt(7);
        }
        this.writeByte(Number(value & BigInt(0x7F)));
    }

    writeFixed32(value: number): void {
        this.buffer.writeUInt32LE(value, this.offset);
        this.offset += 4;
    }

    writeFixed64(value: bigint): void {
        const low = Number(value & BigInt(0xFFFFFFFF));
        const high = Number((value >> BigInt(32)) & BigInt(0xFFFFFFFF));
        this.writeFixed32(low);
        this.writeFixed32(high);
    }

    writeFloat(value: number): void {
        this.buffer.writeFloatLE(value, this.offset);
        this.offset += 4;
    }

    writeDouble(value: number): void {
        this.buffer.writeDoubleLE(value, this.offset);
        this.offset += 8;
    }

    writeTag(fieldNumber: number, wireType: WireType): void {
        this.writeVarint((fieldNumber << 3) | wireType);
    }

    build(): Buffer {
        return this.buffer;
    }
}

