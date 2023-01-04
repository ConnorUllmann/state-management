import { DeepClone, DeepReadonly } from "./deep-utils";

export type Operator<Model> = (state: Model) => Model
export type Patch<Model> = { [K in keyof Model]?: Model[K] | Operator<Model[K]> }
type Fn = (...args: any[]) => any;
type PatchValues<Model> = { readonly [K in keyof Model]?: Model[K] extends Fn ? ReturnType<Model[K]> : Model[K] }

export const isOperator = <Model>(x: any | Operator<Model>): x is Operator<Model> => typeof x === 'function';

export const patch = <Model>(patch: Patch<Model> | DeepReadonly<Patch<Model>>): Operator<Model> => {
  const fn = (state: PatchValues<Model>): Model => {
    let result: Record<string, any> | null = null;
    for(const key in patch) {
      const newValueTemp = patch[key as keyof Patch<Model>];
      const oldValue = state[key as keyof typeof state];
      const newValue = isOperator(newValueTemp) ? newValueTemp(oldValue) : newValueTemp;

      if(oldValue === newValue)
        continue;
      
      if(!result)
        result = { ...state };
      
      // if an undefined value is sent through, delete the key it was sent under
      // this is possible because undefineds can't be stored in state, so this is the only meaning
      if(newValue === undefined)
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
  const fn = (state: Element[]): Element[] => {
    const x = DeepClone(state);
    x.push(...append);
    return x;
  }
  fn['__arrayAppend'] = append;
  return fn;
}

export const arrayRemoveAt = <Element>(index: number): Operator<Element[]> => {
  const fn = (state: Element[]): Element[] => {
    const x = DeepClone(state);
    x.splice(index, 1);
    return x;
  }
  fn['__arrayRemoveAt'] = index;
  return fn;
}


export const arrayRemoveFirst = <Element>(element: Element): Operator<Element[]> => {
  const fn = (state: Element[]): Element[] => {
    const index = state.indexOf(element);
    return index >= 0 && index < state.length ? arrayRemoveAt<Element>(index)(state) : DeepClone(state);
  }
  fn['__arrayRemoveFirst'] = element;
  return fn;
}


export const arraySetAt = <Element>(index: number, value: Element): Operator<Element[]> => {
  const fn = (state: Element[]): Element[] => {
    const x = DeepClone(state);
    x[index] = value;
    return x;
  }
  fn['__arrayUpdateAt'] = index;
  return fn;
}


export const arrayFilter = <Element>(condition: (element: Element, index: number, array: Element[]) => boolean): Operator<Element[]> => {
  const fn = (state:Element[]): Element[] => DeepClone(state).filter(condition);
  return fn;
}


export const booleanToggle = (state: boolean) => !state;