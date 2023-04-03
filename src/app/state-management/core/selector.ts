import { BehaviorSubject, combineLatest } from "rxjs";
import { IState, StateModel } from "./models/state.model";

export const selectorIdField = '__selectorId' as const

type IStateSelectable<Model extends StateModel<Model>> = Readonly<Pick<IState<Model>, 'stateId' | 'data$'>>

export type ISelectorParent<T extends StateModel<T>> = SelectorFn<T> | IStateSelectable<T> | BehaviorSubject<T>

export type ISelectorClass = { new(): { _?: never } };
export type HasSelectorId = { readonly [selectorIdField]: string }
export type SelectorFn<Return> = (((...args: any[]) => Return))
type SelectorFnAndStateReturnTypes<SelectorFnsAndStates extends readonly ISelectorParent<any>[]> = {
  [K in keyof SelectorFnsAndStates]: SelectorFnsAndStates[K] extends SelectorFn<any>
    ? ReturnType<SelectorFnsAndStates[K]>
    : SelectorFnsAndStates[K] extends IStateSelectable<infer Model>
    ? Model
    : SelectorFnsAndStates[K] extends BehaviorSubject<infer Model>
    ? Model
    : never
}


export const lastArgumentsRunWithBySelectorId: Record<string, any[]> = {};
export const behaviorSubjectBySelectorId: Record<any, BehaviorSubject<any>> = {};

const shouldRecalculateSelector = (lastParentSelectorValues: any[] | undefined, newParentSelectorValues: any[]) => {
  return lastParentSelectorValues === undefined
      || lastParentSelectorValues.length != newParentSelectorValues.length
      || lastParentSelectorValues.some((last, i) => last !== newParentSelectorValues[i]);
}

const updateSelector = (selectorId: string, selectorArgs: any[], selectorFn: (...args: any[]) => any) => {
  if(shouldRecalculateSelector(lastArgumentsRunWithBySelectorId[selectorId], selectorArgs)) {
    const value = selectorFn(...selectorArgs as any);
    if(!behaviorSubjectBySelectorId[selectorId])
      behaviorSubjectBySelectorId[selectorId] = new BehaviorSubject(value);
    else
      behaviorSubjectBySelectorId[selectorId]!.next(value);
  }
  lastArgumentsRunWithBySelectorId[selectorId] = selectorArgs;
}

let selectorId = 0;
export const createSelector = <ParentSelectorFns extends readonly ISelectorParent<any>[], U>(
  ...args: [...selectorFns: ParentSelectorFns, fn: (...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U]
): ((...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U) => {
  const selectorFns = args.slice(0, -1) as unknown as ParentSelectorFns;
  const fn = args[args.length-1] as (...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U;
  if(selectorIdField in fn)
    throw new Error(`Cannot create selector from function that is being used by another selector (already in use by selector with id '${(fn as any)[selectorIdField]}')`);
  
  const newSelectorId = (selectorId++).toString()
  Object.defineProperty(fn, selectorIdField, { configurable: false, enumerable: false, writable: false, value: newSelectorId });
  
  const parentBehaviorSubjects = selectorFns.map(o => 'stateId' in o ? o.data$ : selectorIdField in o ? behaviorSubjectBySelectorId[o[selectorIdField] as any]! : o);

  if(parentBehaviorSubjects.length <= 0) {
    // if a selector has no parents, just call it and save the value for it
    updateSelector(newSelectorId, [], fn);
  } else {
    combineLatest(parentBehaviorSubjects).subscribe(selectorArgs => updateSelector(newSelectorId, selectorArgs, fn))
  }
  return fn as any;
}

const disallowedSelectorPropertyNames = new Set<string>(['caller', 'callee', 'arguments']);
const getSelectorPropertyNames = (selectorClass: ISelectorClass) => {
  let propertyNames = new Set<string>();
  let obj = selectorClass;
  while (obj && obj.constructor !== Object) {
    const keys = Object.getOwnPropertyNames(obj) as (keyof typeof selectorClass)[];
    for (const key of keys) {
      if (disallowedSelectorPropertyNames.has(key)) continue;
      if (selectorClass[key][selectorIdField] !== undefined && typeof selectorClass[key] === 'function')
        propertyNames.add(key);
    }
    obj = Object.getPrototypeOf(obj);
  }
  return Array.from(propertyNames);
};

export function addSelectorProperties<SelectorClass extends ISelectorClass>(obj: Record<string, any>, selectorClass: SelectorClass) {
  const propertyNames = getSelectorPropertyNames(selectorClass) as (keyof typeof selectorClass)[];
  for(const propertyName of propertyNames) {
    Object.defineProperty(
      obj,
      propertyName,
      {
        configurable: true,
        enumerable: true,
        get() {
          const selectorFn = selectorClass[propertyName] as unknown as SelectorFn<any>;
          const selectorFnId = (selectorFn as unknown as HasSelectorId)[selectorIdField];
          const behaviorSubject = behaviorSubjectBySelectorId[selectorFnId]
          return behaviorSubject;
        }
      }
    )
  }
}
