import { BehaviorSubject, Observable } from "rxjs";
import { DeepReadonly } from "../deep-utils";
import { Operator, Patch } from "../operators";
import { IndexSignatureKey } from "../utility-types/index-signature-key";
import { NonOptionalKeys } from "../utility-types/is-key-optional";

export const facadeSetProperty = 'set' as const;
type FacadeSetProperty<Model> = { readonly set: (value: Model | Operator<Model>) => Observable<void> }

type FacadeSetNode<Model, Keys extends PropertyKey[] = []> = FacadeSetProperty<Model> & (NonNullable<Model> extends readonly any[]
  ? object
  : NonNullable<Model> extends object
  ? Readonly<{ [Key in keyof NonNullable<Model>]: FacadeSetNode<NonNullable<Model>[Key], [...Keys, Key]> }>
  : object);

export type FacadeSetField<Model, Keys extends PropertyKey[] = []> = FacadeSetProperty<Model> & Readonly<{
  [Key in NonOptionalKeys<NonNullable<Model>>]: FacadeSetNode<NonNullable<Model>[Key], [...Keys, Key]>
}>



export const facadeResetProperty = 'reset' as const;
type FacadeResetProperty = { readonly reset: () => Observable<void> }

type FacadeResetNode<Model, Keys extends PropertyKey[] = []> = FacadeResetProperty & (NonNullable<Model> extends readonly any[]
  ? object
  : NonNullable<Model> extends object
  ? Readonly<{ [Key in keyof NonNullable<Model>]: FacadeResetNode<NonNullable<Model>[Key], [...Keys, Key]> }>
  : object);

export type FacadeResetField<Model, Keys extends PropertyKey[] = []> = FacadeResetProperty & Readonly<{
  [Key in NonOptionalKeys<NonNullable<Model>>]: FacadeResetNode<NonNullable<Model>[Key], [...Keys, Key]>
}>



export const facadePatchProperty = 'patch' as const;
type FacadePatchProperty<Model> = { readonly patch: (value: DeepReadonly<Patch<Model>>) => Observable<void> }

type FacadePatchNode<Model, Keys extends PropertyKey[] = []> = (NonNullable<Model> extends readonly any[]
  ? object
  : NonNullable<Model> extends object
  ? FacadePatchProperty<Model> & Readonly<{ [Key in keyof NonNullable<Model>]: FacadePatchNode<NonNullable<Model>[Key], [...Keys, Key]> }>
  : object);

export type FacadePatchField<Model, Keys extends PropertyKey[] = []> = FacadePatchProperty<Model> & Readonly<{
  [Key in NonOptionalKeys<NonNullable<Model>>]: FacadePatchNode<NonNullable<Model>[Key], [...Keys, Key]>
}>


export const facadeDeleteProperty = 'delete' as const;
// if there's an index signature, we can delete properties; otherwise 
type FacadeDeleteProperty<Model> = IndexSignatureKey<Model> extends never ? unknown : { readonly delete: (...keys: IndexSignatureKey<Model>[]) => Observable<void> }

type FacadeDeleteNode<Model, Keys extends PropertyKey[] = []> = (NonNullable<Model> extends readonly any[]
  ? object
  : NonNullable<Model> extends object
  ? FacadeDeleteProperty<Model> & Readonly<{ [Key in keyof NonNullable<Model>]: FacadeDeleteNode<NonNullable<Model>[Key], [...Keys, Key]> }>
  : object);

export type FacadeDeleteField<Model, Keys extends PropertyKey[] = []> = FacadeDeleteProperty<Model> & Readonly<{
  [Key in NonOptionalKeys<NonNullable<Model>>]: FacadeDeleteNode<NonNullable<Model>[Key], [...Keys, Key]>
}>



export const facadeSelectProperty = 'select$';
type FacadeSelectProperty<Model> = { readonly select$: BehaviorSubject<DeepReadonly<Model>> };

type FacadeSelectNode<Model, Keys extends PropertyKey[] = []> = FacadeSelectProperty<Model> & (NonNullable<Model> extends readonly any[]
  ? object
  : NonNullable<Model> extends object
  ? Readonly<{ [Key in keyof NonNullable<Model>]: FacadeSelectNode<NonNullable<Model>[Key], [...Keys, Key]> }>
  : object);

export type FacadeSelectField<Model, Keys extends PropertyKey[] = []> = FacadeSelectProperty<Model> & Readonly<{
  [Key in NonOptionalKeys<NonNullable<Model>>]: FacadeSelectNode<NonNullable<Model>[Key], [...Keys, Key]>
}>