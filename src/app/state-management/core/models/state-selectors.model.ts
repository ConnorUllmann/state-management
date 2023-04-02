import { DeepReadonly } from "../deep-utils";
import { SelectorFn } from "../selector";
import { OptionalByKey } from "../utility-types/is-key-optional";

// if a field is not able to be undefined, but its a field on an object that can be undefined/null, then let the undefined fall through
type FallthroughUndefined<Model, Key extends keyof NonNullable<Model>> = Key extends keyof Model ? Model[Key] : NonNullable<Model>[Key] | undefined;

export const stateSelectorProperty = 'selector';
export type StateSelectorProperty<Model> = { readonly selector: SelectorFn<DeepReadonly<Model>> };

export type StateSelectorNode<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (NonNullable<Model> extends readonly any[]
  ? {}
  : NonNullable<Model> extends object
  ? {
    readonly [Key in keyof OptionalByKey<NonNullable<Model>>]: OptionalByKey<NonNullable<Model>>[Key] extends false
      ? StateSelectorNode<FallthroughUndefined<Model, Key>, [...Keys, Key]>
      : never 
  }
  : {});

export type StateSelectorField<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (NonNullable<Model> extends object ? {
  readonly [Key in keyof OptionalByKey<NonNullable<Model>>]: OptionalByKey<NonNullable<Model>>[Key] extends false
    ? StateSelectorNode<FallthroughUndefined<Model, Key>, [...Keys, Key]>
    : never
} : {})