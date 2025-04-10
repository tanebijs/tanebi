import { ProtoField } from '../src/ProtoField';
import { ProtoMessage } from '../src/ProtoMessage';
import { ScalarType } from '../src/ScalarType';

import { NapProtoMsg, ProtoField as NPF, ScalarType as NST } from '@napneko/nap-proto-core';

console.time('@tanebijs/protobuf warmup');
const TestMessage = ProtoMessage.of({
    uint32Field: ProtoField(1, ScalarType.UINT32, false, false),
    fixed32Field: ProtoField(2, ScalarType.FIXED32, false, false),
    sint32Field: ProtoField(3, ScalarType.SINT32, false, false),
    boolField: ProtoField(4, ScalarType.BOOL, false, false),
    stringField: ProtoField(5, ScalarType.STRING, false, false),
    nestedMessageField: ProtoField(6, () => ({
        nestedField: ProtoField(1, ScalarType.UINT32, false, false),
    }), false, false),
    repeatedMessageField: ProtoField(7, () => ({
        nestedField: ProtoField(1, ScalarType.UINT32, false, false),
    }), false, true),
    repeatedPackedField: ProtoField(8, ScalarType.UINT32, false, true, true),
    // repeatedNotPackedField: ProtoField(9, ScalarType.UINT32, false, true, false),
});
console.timeEnd('@tanebijs/protobuf warmup');

console.time('@napneko/nap-proto-core (based on @protobuf-ts/runtime) warmup');
const TestMessage_NapProto = new NapProtoMsg({
    uint32Field: NPF(1, NST.UINT32, false, false),
    fixed32Field: NPF(2, NST.FIXED32, false, false),
    sint32Field: NPF(3, NST.SINT32, false, false),
    boolField: NPF(4, NST.BOOL, false, false),
    stringField: NPF(5, NST.STRING, false, false),
    nestedMessageField: NPF(6, () => ({
        nestedField: NPF(1, NST.UINT32, false, false),
    }), false, false),
    repeatedMessageField: NPF(7, () => ({
        nestedField: NPF(1, NST.UINT32, false, false),
    }), false, true),
    repeatedPackedField: NPF(8, NST.UINT32, false, true),
    // repeatedNotPackedField: NPF(9, NST.UINT32, false, true, false),
});
console.timeEnd('@napneko/nap-proto-core (based on @protobuf-ts/runtime) warmup');

console.time('@tanebijs/protobuf encode');
for (let i = 0; i < 100000; i++) {
    TestMessage.encode({
        uint32Field: 1,
        fixed32Field: 2,
        sint32Field: -1,
        boolField: true,
        stringField: 'test',
        nestedMessageField: {
            nestedField: 1,
        },
        repeatedMessageField: [
            { nestedField: 1 },
            { nestedField: 2 },
        ],
        repeatedPackedField: [1, 2, 3],
        // repeatedNotPackedField: [4, 5, 6],
    });
}
console.timeEnd('@tanebijs/protobuf encode');

console.time('@napneko/nap-proto-core (based on @protobuf-ts/runtime) encode');
for (let i = 0; i < 100000; i++) {
    TestMessage_NapProto.encode({
        uint32Field: 1,
        fixed32Field: 2,
        sint32Field: -1,
        boolField: true,
        stringField: 'test',
        nestedMessageField: {
            nestedField: 1,
        },
        repeatedMessageField: [
            { nestedField: 1 },
            { nestedField: 2 },
        ],
        repeatedPackedField: [1, 2, 3],
        // repeatedNotPackedField: [4, 5, 6],
    });
}
console.timeEnd('@napneko/nap-proto-core (based on @protobuf-ts/runtime) encode');