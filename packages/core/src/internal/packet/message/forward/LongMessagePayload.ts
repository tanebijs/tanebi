import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const LongMessagePayload = ProtoMessage.of({
    actions: ProtoField(
        2,
        () => ({
            command: ProtoField(1, ScalarType.STRING),
            data: ProtoField(2, () => ({
                msgs: ProtoField(1, ScalarType.BYTES, false, true),
            })),
        }),
        false,
        true,
    ),
});
