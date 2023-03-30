import { DeepReadonly } from "../deep-utils";
import { SelectorFn } from "../selector";
import { OptionalByKey } from "../utility-types/is-key-optional";

export const stateSelectorProperty = 'selector';
export type StateSelectorProperty<Model> = { readonly selector: SelectorFn<DeepReadonly<Model>> };

export type StateSelectorNode<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (NonNullable<Model> extends readonly any[]
  ? {}
  : NonNullable<Model> extends object
  ? { readonly [Key in keyof OptionalByKey<NonNullable<Model>>]: OptionalByKey<NonNullable<Model>>[Key] extends false ? StateSelectorNode<NonNullable<Model>[Key], [...Keys, Key]> : never }
  : {});

export type StateSelectorField<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (NonNullable<Model> extends object ? {
  readonly [Key in keyof OptionalByKey<NonNullable<Model>>]: OptionalByKey<NonNullable<Model>>[Key] extends false ? StateSelectorNode<NonNullable<Model>[Key], [...Keys, Key]> : never
} : {})