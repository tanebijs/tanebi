import { Tlv, TlvScalarField, TlvFixedBytesField, TlvVariableField, PackedTlv } from 'tanebi/lib/internal/util/binary/tlv';

const schema1 = Tlv.tagged([
    TlvScalarField('foo', 'int32'),
    TlvScalarField('bar', 'uint32'),
    TlvFixedBytesField('padding', 2),
    TlvVariableField('baz', 'string', 'uint32', true),
], '0x0001');

const schema2 = Tlv.tagged([
    TlvScalarField('c', 'int32'),
    TlvVariableField('x', 'string', 'uint32', true),
], '0x02');

const packed = PackedTlv.fromCollection([
    schema1,
    schema2,
]);

const encoded = packed.pack({
    '0x0001': {
        foo: 1,
        bar: 2,
        padding: Buffer.from([0x00, 0x01]),
        baz: 'hello',
    },
    '0x02': {
        c: 3,
        x: 'world',
    }
});
console.log(encoded.toString('hex'));
const decoded = packed.unpack(encoded);
console.log(decoded);