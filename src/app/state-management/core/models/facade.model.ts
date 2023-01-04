import { BehaviorSubject, Observable } from "rxjs";
import { DeepReadonly } from "../deep-utils";
import { Operator, Patch } from "../operators";

export const facadeSetProperty = 'set' as const;
type FacadeSetProperty<Model> = { readonly set: (value: Model | Operator<Model>) => Observable<void> }

type FacadeSetNode<Model, Keys extends PropertyKey[] = []> = FacadeSetProperty<Model> & (Model extends readonly any[]
  ? object
  : Model extends object
  ? Readonly<{ [Key in keyof Model]: FacadeSetNode<Model[Key], [...Keys, Key]> }>
  : object);

export type FacadeSetField<Model, Keys extends PropertyKey[] = []> = FacadeSetProperty<Model> & Readonly<{
  [Key in keyof Model]: FacadeSetNode<Model[Key], [...Keys, Key]>
}>



export const facadeResetProperty = 'reset' as const;
type FacadeResetProperty = { readonly reset: () => Observable<void> }

type FacadeResetNode<Model, Keys extends PropertyKey[] = []> = FacadeResetProperty & (Model extends readonly any[]
  ? object
  : Model extends object
  ? Readonly<{ [Key in keyof Model]: FacadeResetNode<Model[Key], [...Keys, Key]> }>
  : object);

export type FacadeResetField<Model, Keys extends PropertyKey[] = []> = FacadeResetProperty & Readonly<{
  [Key in keyof Model]: FacadeResetNode<Model[Key], [...Keys, Key]>
}>



export const facadePatchProperty = 'patch' as const;
type FacadePatchProperty<Model> = { readonly patch: (value: DeepReadonly<Patch<Model>>) => Observable<void> }

type FacadePatchNode<Model, Keys extends PropertyKey[] = []> = (Model extends readonly any[]
  ? object
  : Model extends object
  ? FacadePatchProperty<Model> & Readonly<{ [Key in keyof Model]: FacadePatchNode<Model[Key], [...Keys, Key]> }>
  : object);

export type FacadePatchField<Model, Keys extends PropertyKey[] = []> = FacadePatchProperty<Model> & Readonly<{
  [Key in keyof Model]: FacadePatchNode<Model[Key], [...Keys, Key]>
}>



export const facadeSelectProperty = 'select$';
type FacadeSelectProperty<Model> = { readonly select$: BehaviorSubject<DeepReadonly<Model>> };

type FacadeSelectNode<Model, Keys extends PropertyKey[] = []> = FacadeSelectProperty<Model> & (Model extends readonly any[]
  ? object
  : Model extends object
  ? Readonly<{ [Key in keyof Model]: FacadeSelectNode<Model[Key], [...Keys, Key]> }>
  : object);

export type FacadeSelectField<Model, Keys extends PropertyKey[] = []> = FacadeSelectProperty<Model> & Readonly<{
  [Key in keyof Model]: FacadeSelectNode<Model[Key], [...Keys, Key]>
}>