# @tanebijs/protobuf

This package is the Protobuf infrastructure for the project, which provides efficient serialization and deserialization of protocol packets.

## Efficiency

`@tanebijs/protobuf` is **3x faster** than unoptimized `@protobuf-ts/runtime` when serializing 100000 same messages in a row, and **1.4x faster** when deserializing, according to the benchmark test. The efficiency is crucial for the performance of the entire project, as EVERY incoming and outgoing message is in Protobuf format. The efficiency of this package comes from the fact that it "compiles" the model written in TypeScript and tends to expand all the logic ahead of use, instead of determining which part of the logic to use at runtime with tons of `if` and `switch` statements.

The latter approach is the one used by `@protobuf-ts/runtime`, which is a general-purpose library that can be used in any environment, but it is not optimized for the specific use case of this project. `protobuf-ts` can also optimize the code by expanding the logic, but only when compiling proto files. This project did not use raw proto files, but instead used DSL-like code to describe the model, so it cannot benefit from the optimizations of `protobuf-ts`.

## DSL-like Model Description

The DSL is designed by [`@napneko/nap-proto-core`](https://npmjs.com/package/@napneko/nap-proto-core), which uses `@protobuf-ts/runtime` as the backend, and is used by `tanebi` before this package is born. The DSL describes the model in an elegant way and is still valid TypeScript code, and can be used directly for type inference. This package fully adopted this style of model description.
