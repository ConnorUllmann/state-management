import { BehaviorSubject, Observable, of } from "rxjs";
import { DeepReadonly } from "./deep-utils";
import { IActionClass } from "./models/action.model";
import { FacadePatchField, facadePatchProperty, FacadeResetField, facadeResetProperty, FacadeSelectField, facadeSelectProperty, FacadeSetField, facadeSetProperty } from "./models/facade.model";
import { StateSelectorField, StateSelectorProperty, stateSelectorProperty } from "./models/state-selectors.model";
import { IState, StateModel } from "./models/state.model";
import { Operator, patch } from "./operators";
import { addSelectorProperties, behaviorSubjectBySelectorId, HasSelectorId, ISelectorClass, selectorIdField } from "./selector";
import { Store } from "./store";

export type IActionClassByName = Record<string, IActionClass<any>> & { store?: never }
export type IStateClassByName = Record<string, Readonly<IState<any>>> & { store?: never }

type Values<T> = T[keyof T]

type OmitNever<T> = Pick<T, Values<{
    [Prop in keyof T]: [T[Prop]] extends [never] ? never : Prop
}>>

type StateProperty<Model> = FacadeSelectField<Model> & FacadeSetField<Model> & FacadeResetField<Model> & FacadePatchField<Model>
type ToStateModel<StateClass> = StateClass extends Readonly<IState<infer Model>>
  ? Model
  : StateClass extends Readonly<IState<StateModel<infer Model>>>
    ? Model
    : never;
  
type SelectOfSelectorFn<SelectorFn> = SelectorFn extends ((...args: any[]) => any)
  ? BehaviorSubject<DeepReadonly<ReturnType<SelectorFn>>>
  : never

export type IFacade<ActionClasses extends IActionClassByName, StateClasses extends IStateClassByName, SelectorClasses extends ISelectorClass[]> = Omit<{
  [K in keyof ActionClasses]: (...args: ConstructorParameters<ActionClasses[K]>) => Observable<void>
} & {
  [K in keyof StateClasses]: StateProperty<ToStateModel<StateClasses[K]>>
} & {
  [SelectorClassIndex in keyof SelectorClasses]: SelectorClasses[SelectorClassIndex] extends infer SelectorClass
    ? OmitNever<Readonly<{ [SelectorFunctionName in keyof SelectorClass]: SelectOfSelectorFn<SelectorClass[SelectorFunctionName]> }>>
    : never
}[number], 'store'> & { store: Store | null }

const addActionPropertes = <ActionClasses extends IActionClassByName>(getStore: () => Store | null, obj: Record<string, any>, actionClasses: ActionClasses) => {  
  for(const propertyName in actionClasses) {
    const actionClass = actionClasses[propertyName];
    if(!actionClass)
      continue;
    Object.defineProperty(
      obj,
      propertyName,
      {
        configurable: true,
        enumerable: true,
        writable: false,
        value: (...args: any[]) => {
          const store = getStore()
          if(store == null) {
            console.error(`Action dispatch from facade executed with no assigned store.`)
            return of();
          }
          return store.dispatch(actionClass, ...args as any)
        }
      }
    )
  }
}

const getSetOperation = (path: string[], value: any) => {
  let operator = value;
  for(let i = path.length-1; i >= 0; i--)
    operator = patch({ [path[i]!]: operator });
  return operator;
}

const getPatchOperation = (path: string[], value: any) => {
  let operator: Operator<any> = patch(value);
  for(let i = path.length-1; i >= 0; i--)
    operator = patch({ [path[i]!]: operator });
  return operator;
}

const dispatchOperation = <Model>(
  getStore: () => Store | null,
  operator: Operator<Model> | null,
  setAction: IActionClass<{ value: Model }>
): Observable<void> => {
  if(operator == null)
    return of();

  const store = getStore();
  if(!store) {
    console.error(`State setter action dispatched from facade executed with no assigned store.`)
    return of();
  }
  return store.dispatch(setAction, operator)
}

const getStateSettersAndSelectors = <Model extends StateModel<Model>>(
  getStore: () => Store | null,
  initialData: DeepReadonly<Model>,
  operatorAction: IActionClass<{ value: Operator<Model> }>,
  selectors: DeepReadonly<StateSelectorField<Model>>
) => {
  const node = {};

  Object.defineProperty(
    node,
    facadeSetProperty,
    {
      configurable: false,
      enumerable: true,
      writable: false,
      value: (value: any) => dispatchOperation(getStore, getSetOperation([], value), operatorAction)
    }
  )

  Object.defineProperty(
    node,
    facadeResetProperty,
    {
      configurable: false,
      enumerable: true,
      writable: false,
      value: () => (node as any)[facadeSetProperty](initialData as any)
    }
  )

  Object.defineProperty(
    node,
    facadeSelectProperty,
    {
      configurable: false,
      enumerable: true,
      get() { return behaviorSubjectBySelectorId[(selectors[stateSelectorProperty] as HasSelectorId)[selectorIdField] as string] }
    }
  )
  
  getStateSettersAndSelectorsHelper(node, getStore, initialData, operatorAction, selectors, []);

  Object.defineProperty(
    node,
    facadePatchProperty,
    {
      configurable: false,
      enumerable: true,
      writable: false,
      value: (patch: any) => dispatchOperation(getStore, getPatchOperation([], patch), operatorAction)
    }
  )

  return node;
}

const getStateSettersAndSelectorsHelper = <Model extends StateModel<Model>>(
  obj: any,
  getStore: () => Store | null,
  initialData: DeepReadonly<Model>,
  operatorAction: IActionClass<{ value: Operator<Model> }>,
  selectors: DeepReadonly<StateSelectorField<Model>>,
  pathSoFar: string[]
) => {
  for(const key in initialData) {
    if(!(key in selectors))
      throw new Error(`No selector found for property "${key}"`)
    
    const initialDataValue = initialData[key as keyof typeof initialData];
    const selectorsValue = selectors[key as keyof typeof selectors];

    const isLeafNode = Array.isArray(initialDataValue) || typeof initialDataValue !== 'object';

    const pathNext = [...pathSoFar, key];
    const node = obj[key] = {}

    Object.defineProperty(
      node,
      facadeSetProperty,
      {
        configurable: false,
        enumerable: true,
        writable: false,
        value: (value: any) => dispatchOperation(getStore, getSetOperation(pathNext, value), operatorAction)
      }
    )

    Object.defineProperty(
      node,
      facadeResetProperty,
      {
        configurable: false,
        enumerable: true,
        writable: false,
        value: () => (node as any)[facadeSetProperty](initialDataValue as any)
      }
    )

    Object.defineProperty(
      node,
      facadeSelectProperty,
      {
        configurable: false,
        enumerable: true,
        get() { return behaviorSubjectBySelectorId[((selectorsValue as StateSelectorProperty<Model>)[stateSelectorProperty] as unknown as HasSelectorId)[selectorIdField] as string] }
      }
    )

    if(!isLeafNode) {
      getStateSettersAndSelectorsHelper(node, getStore, initialDataValue as any, operatorAction, selectorsValue as any, pathNext);

      Object.defineProperty(
        node,
        facadePatchProperty,
        {
          configurable: false,
          enumerable: true,
          writable: false,
          value: (patch: any) => dispatchOperation(getStore, getPatchOperation(pathNext, patch), operatorAction)
        }
      )
    }
  }
}

export function Facade<
  ActionClasses extends IActionClassByName,
  StateClasses extends IStateClassByName,
  SelectorClasses extends ISelectorClass[]
>(
  store: Store,
  actionClasses: ActionClasses,
  states: StateClasses,
  ...selectorClasses: SelectorClasses
): IFacade<ActionClasses, StateClasses, SelectorClasses> {
  const obj: { store: Store | null } & any = {
    store
  };
  const getStore = () => obj.store;
  addActionPropertes(getStore, obj, actionClasses);
  for(const key in states) {
    const state = states[key];
    if(!state)
      throw new Error('No state found for key "${key}" when creating facade')
    
    obj[key] = getStateSettersAndSelectors(getStore, state.initialData, state.operatorAction, state.selectors as any)
  }
  selectorClasses.forEach(selectorClass => addSelectorProperties(obj, selectorClass));
  return obj as IFacade<ActionClasses, StateClasses, SelectorClasses>;
}

