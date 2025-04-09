import { WireType } from './WireType';

export class SizeOf {
    static varint(value: number | bigint): number {
        if (typeof value === 'number') {
            return this.varint32(value);
        } else {
            return this.varint64(value);
        }
    }

    static varint32(value: number): number {
        let size = 1;
        while (value > 0x7F) {
            size++;
            value >>>= 7;
        }
        return size;
    }

    static varint64(value: bigint): number {
        let size = 1;
        while (value > BigInt(0x7F)) {
            size++;
            value >>= BigInt(7);
        }
        return size;
    }

    static tag(fieldNumber: number, wireType: WireType): number {
        return this.varint32((fieldNumber << 3) | wireType);
    }
}