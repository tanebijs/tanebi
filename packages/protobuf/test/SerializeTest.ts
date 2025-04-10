import { ProtoField } from '../src/ProtoField';
import { ProtoMessage } from '../src/ProtoMessage';
import { ScalarType } from '../src/ScalarType';

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
    repeatedNotPackedField: ProtoField(9, ScalarType.UINT32, false, true, false),
});

console.log(TestMessage.encode({
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
    repeatedNotPackedField: [4, 5, 6],
}).toString('hex'));