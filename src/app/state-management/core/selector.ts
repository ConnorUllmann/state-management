import { BehaviorSubject, combineLatest } from "rxjs";
import { IState, StateModel } from "./models/state.model";

export const selectorIdField = '__selectorId' as const

type IStateSelectable<Model extends StateModel<Model>> = Readonly<Pick<IState<Model>, 'stateId' | 'data$'>>

export type ISelectorClass = { new(): { _?: never } };
export type SelectorFn<Return> = (((...args: any[]) => Return) & { readonly [selectorIdField]: string })
type SelectorFnAndStateReturnTypes<SelectorFnsAndStates extends readonly (SelectorFn<any> | IStateSelectable<any> | BehaviorSubject<any>)[]> = {
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

let selectorId = 0;
export const createSelector = <ParentSelectorFns extends readonly (SelectorFn<any> | IStateSelectable<any> | BehaviorSubject<any>)[], U>(
  ...args: [...selectorFns: ParentSelectorFns, fn: (...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U]
): ((...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U) & { [selectorIdField]: string } => {
  const selectorFns = args.slice(0, -1) as unknown as ParentSelectorFns;
  const fn = args[args.length-1] as (...args: SelectorFnAndStateReturnTypes<ParentSelectorFns>) => U;
  if(selectorIdField in fn)
    throw new Error(`Cannot create selector from function that is being used by another selector (already in use by selector with id '${(fn as any)[selectorIdField]}')`);
  
  const newSelectorId = (selectorId++).toString()
  Object.defineProperty(fn, selectorIdField, { configurable: false, enumerable: false, writable: false, value: newSelectorId });
  const parentBehaviorSubjects = selectorFns.map(o => 'stateId' in o ? o.data$ : selectorIdField in o ? behaviorSubjectBySelectorId[o[selectorIdField]]! : o);
  combineLatest(parentBehaviorSubjects).subscribe((selectorValues) => {
    if(shouldRecalculateSelector(lastArgumentsRunWithBySelectorId[newSelectorId], selectorValues)) {
      const value = fn(...selectorValues as any);
      if(!behaviorSubjectBySelectorId[newSelectorId])
        behaviorSubjectBySelectorId[newSelectorId] = new BehaviorSubject(value);
      else
        behaviorSubjectBySelectorId[newSelectorId]!.next(value);
    }
    lastArgumentsRunWithBySelectorId[newSelectorId] = selectorValues;
  })
  return fn as any;
}

const getSelectorPropertyNames = (selectorClass: ISelectorClass) => {
  let propertyNames = new Set<string>();
  let obj = selectorClass;
  while(obj && obj.constructor !== Object) {
    const keys = Object.getOwnPropertyNames(selectorClass) as (keyof typeof selectorClass)[];
    for(const key of keys) {
      if(selectorClass[key][selectorIdField] !== undefined && typeof selectorClass[key] === 'function')
        propertyNames.add(key);
    }
    obj = Object.getPrototypeOf(obj);
  }
  return Array.from(propertyNames);
}

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
          const selectorFnId = selectorFn[selectorIdField];
          const behaviorSubject = behaviorSubjectBySelectorId[selectorFnId]
          return behaviorSubject;
        }
      }
    )
  }
}
