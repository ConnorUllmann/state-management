import { DeepReadonly } from "../deep-utils";
import { SelectorFn } from "../selector";

export const stateSelectorProperty = 'selector';
export type StateSelectorProperty<Model> = { readonly selector: SelectorFn<DeepReadonly<Model>> };

export type StateSelectorNode<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (Model extends readonly any[]
  ? {}
  : Model extends object
  ? { readonly [Key in keyof Model]: StateSelectorNode<Model[Key], [...Keys, Key]> }
  : {});

export type StateSelectorField<Model, Keys extends PropertyKey[] = []> = StateSelectorProperty<Model> & (Model extends object ? {
  readonly [Key in keyof Model]: StateSelectorNode<Model[Key], [...Keys, Key]>
} : {})