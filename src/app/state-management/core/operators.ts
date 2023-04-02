import { DeepClone, DeepReadonly } from "./deep-utils";
import { IsKeyOptional } from "./utility-types/is-key-optional";

export const DeleteProperty = Symbol();

export type Operator<Model> = (state: DeepReadonly<Model>) => Model


type PatchWithOptionalProps<Model> = { [K in keyof Model]?: (IsKeyOptional<Model, K> extends true ? typeof DeleteProperty : never) | Model[K] | Operator<Model[K]> }
// check each property and if the property on the model isn't able to be undefined, don't let the patch value be undefined (even if the property is optional!)
export type Patch<Model> = PatchWithOptionalProps<Model> extends infer T
  ? {
    [K in keyof T]: K extends keyof Model
      ? undefined extends Model[K]
        ? T[K]
        : Exclude<T[K], undefined>
      : T[K]
  }
  : never;


type Fn = (...args: any[]) => any;
type PatchValues<Model> = { readonly [K in keyof Model]?: Model[K] extends Fn ? ReturnType<Model[K]> : Model[K] }

export const isOperator = <Model>(x: any | Operator<Model>): x is Operator<Model> => typeof x === 'function';

export const patch = <Model>(patch: Patch<Model> | DeepReadonly<Patch<Model>>): Operator<Model> => {
  const fn = (state: PatchValues<Model>): Model => {
    // if we're patching the entire model to undefined, set it and exit
    if(patch === undefined)
      return patch;
    
    let result: Record<string, any> | null = null;
    for(const key in patch) {
      const newValueTemp = patch[key as keyof typeof patch];
      const oldValue = state[key as keyof typeof state];
      const newValue = isOperator(newValueTemp) ? newValueTemp(oldValue as any) : newValueTemp;

      if(oldValue === newValue)
        continue;
      
      if(!result)
        result = { ...state };
      
      if(newValue === DeleteProperty)
        delete result[key];
      else 
        result[key] = newValue;
    }
    return (result ?? state) as unknown as Model;
  };
  // useful for debugging payloads
  fn['__patch'] = patch;
  return fn as Operator<Model>;
};


export const arrayAppend = <Element>(...append: Element[]): Operator<Element[]> => {
  const fn = (state: DeepReadonly<Element[]>): Element[] => {
    return [
      ...state as Element[],
      ...append
    ];
  }
  fn['__arrayAppend'] = append;
  return fn;
}

export const arrayRemoveAt = <Element>(index: number): Operator<Element[]> => {
  const fn = (state: DeepReadonly<Element[]>): Element[] => {
    const x = DeepClone<Element[]>(state);
    x.splice(index, 1);
    return x;
  }
  fn['__arrayRemoveAt'] = index;
  return fn;
}

type ListElement<T extends any[]> = T extends readonly (infer E)[] ? E : never;
export const arrayRemoveFirst = <List extends any[]>(element: ListElement<List>, fromIndex?: number | undefined): Operator<List> => {
  const fn = (state: DeepReadonly<List>): List => {
    const index = state.indexOf(element as ListElement<List>, fromIndex);
    return (index >= 0 && index < state.length ? arrayRemoveAt<ListElement<List>>(index)(state) : state) as List;
  }
  fn['__arrayRemoveFirst'] = element;
  return fn;
}


export const arraySetAt = <Element>(index: number, value: Element): Operator<Element[]> => {
  const fn = (state: DeepReadonly<Element[]>): Element[] => {
    const x = [...state] as Element[];
    x[index] = value;
    return x;
  }
  fn['__arrayUpdateAt'] = index;
  return fn;
}


export const arrayFilter = <Element>(condition: (element: DeepReadonly<Element>, index: number, array: readonly DeepReadonly<Element>[]) => boolean): Operator<Element[]> => {
  const fn = (state: DeepReadonly<Element[]>): Element[] => state.filter(condition) as Element[];
  return fn;
}


export const booleanToggle = (state: boolean) => !state;