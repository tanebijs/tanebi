import { InferProtoSpec, InferProtoSpecInput, ProtoFieldType, ProtoSpec } from './ProtoField';

export interface ProtoModel {
    [Key: string]: ProtoSpec<ProtoFieldType, boolean, boolean>;
}

export type InferProtoModel<T extends ProtoModel> = {
    [Key in keyof T]: InferProtoSpec<T[Key]>;
};

export type InferProtoModelInput<T extends ProtoModel> = {
    [Key in keyof T]: InferProtoSpecInput<T[Key]> | undefined;
};
