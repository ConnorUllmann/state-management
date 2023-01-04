import { Observable } from "rxjs";
import { DeepReadonly } from "../deep-utils";
import { Facade, IActionClassByName, IFacade } from "../facade";
import { StateModel } from "../models/state.model";
import { Patch, patch } from "../operators";
import { ISelectorClass } from "../selector";
import { Store } from "../store";
import { getIdField, IEntityState } from "./entity-state.model";


export type IEntityStateClassByName<Entity extends StateModel<Entity>> = Record<string, Readonly<IEntityState<Entity>>> & { store?: never }

type ToEntity<StateClass extends Readonly<IEntityState<StateModel<unknown>>>> = StateClass extends Readonly<IEntityState<infer Entity>> ? DeepReadonly<Entity> : never
export type ToStateClass<StateClass> = StateClass extends Readonly<IEntityState<infer Entity>> ? Entity extends StateModel<Entity> ? StateClass : never : never

const addEntitiesField = 'addEntities' as const;
const removeEntitiesField = 'removeEntities' as const;
const removeIdsField = 'removeIds' as const;
const patchEntityField = 'patchEntity' as const;
export type IEntityFacade<
  ActionClasses extends IActionClassByName,
  StateClass extends Readonly<IEntityState<StateModel<unknown>>>,
  SelectorClasses extends ISelectorClass[],
> = 
  IFacade<ActionClasses, { state: StateClass }, SelectorClasses> & {
    addEntities: (entities: ToEntity<StateClass>[]) => Observable<void>
    removeEntities: (entities: ToEntity<StateClass>[]) => Observable<void>
    removeIds: (ids: string[]) => Observable<void>
    patchEntity: (entityId: string, patch: Patch<ToEntity<StateClass>>) => Observable<void>
  }

export function EntityFacade<
  ActionClasses extends IActionClassByName,
  StateClass,
  SelectorClasses extends ISelectorClass[]
>(
  store: Store,
  actionClasses: ActionClasses,
  state: ToStateClass<StateClass>,
  ...selectorClasses: SelectorClasses
): IEntityFacade<ActionClasses, typeof state, SelectorClasses> {
  const obj = Facade(store, actionClasses, { state }, ...selectorClasses) as IEntityFacade<ActionClasses, typeof state, SelectorClasses>;

  obj[addEntitiesField] = (entities: ToEntity<typeof state>[]) => {
    const patchObj = entities.reduce((acc, entity) => {
      const id = state[getIdField](entity);
      acc[id] = entity;
      return acc;
    }, {} as Record<string, ToEntity<typeof state>>);
    return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
  }

  obj[removeEntitiesField] = (entities: ToEntity<typeof state>[]) => {
    const patchObj = entities.reduce((acc, entity) => {
      const id = state[getIdField](entity);
      acc[id] = undefined;
      return acc;
    }, {} as Record<string, undefined>);
    return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
  };

  obj[removeIdsField] = (ids: string[]) => {
    const patchObj = ids.reduce((acc, id) => {
      acc[id] = undefined;
      return acc;
    }, {} as Record<string, undefined>);
    return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
  };

  obj[patchEntityField] = (entityId: string, patchObj: Patch<ToEntity<typeof state>>) => {
    return store.dispatch(state.operatorAction, patch({ map: patch({ [entityId]: patch(patchObj) }) }) as any)
  }

  return obj;
}