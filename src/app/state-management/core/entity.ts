import { Observable } from "rxjs";
import { DeepReadonly } from "./deep-utils";
import { Facade, IActionClassByName, IFacade } from "./facade";
import { IState, StateModel } from "./models/state.model";
import { DeleteProperty, Patch, patch } from "./operators";
import { createSelector, ISelectorClass } from "./selector";
import { State } from "./state";
import { Store } from "./store";

type IEntityStateModel<Entity extends StateModel<Entity>> = StateModel<{
  map: Record<string, Entity>
}>

const getIdStringField = 'getIdString' as const;
type IEntityState<Entity extends StateModel<Entity>, IdsUnion extends keyof Entity> = IState<IEntityStateModel<Entity>> & {
  readonly getIdString: (entity: Pick<DeepReadonly<Entity>, IdsUnion>) => string
}

type IdProperty<T> = { [K in keyof T]: K extends string | number | boolean ? T[K] extends string | number | boolean ? K : never : never }[keyof T];

export type IdsOf<Entity extends StateModel<Entity>> = IdProperty<Entity> | IdProperty<Entity>[]
type IdsUnion<Entity extends StateModel<Entity>, Ids extends IdProperty<Entity> | IdProperty<Entity>[]> = Ids extends any[] ? Ids[number] : Ids;
export type EntityStateResult<Entity extends StateModel<Entity>, Ids extends IdProperty<Entity> | IdProperty<Entity>[]> = Readonly<IEntityState<Entity, IdsUnion<Entity, Ids>>>

const addEntitiesField = 'addEntities' as const;
const removeEntitiesField = 'removeEntities' as const;
const removeIdsField = 'removeIds' as const;
const patchEntityField = 'patchEntity' as const;

type IEntityFacadeAdditionalProps<Entity> = {
  addEntities: (entities: DeepReadonly<Entity[]>) => Observable<void>
  removeEntities: (entities: DeepReadonly<Entity[]>) => Observable<void>
  removeIds: (ids: string[]) => Observable<void>
  patchEntity: (entityId: string, patch: DeepReadonly<Patch<Entity>>) => Observable<void>
}

type IEntityFacade<
  Entity extends StateModel<Entity>,
  Ids extends IdsOf<Entity>,
  ActionClasses extends IActionClassByName,
  StateClass extends EntityStateResult<Entity, Ids>,
  SelectorClasses extends ISelectorClass[]
> = IFacade<ActionClasses, { state: StateClass }, SelectorClasses> & IEntityFacadeAdditionalProps<Entity>

const getFieldId = (entity: any, entityIdField: PropertyKey): string => {
  const result = entity[entityIdField];
  return typeof result === 'string' ? result : result?.toString() ?? '';
}

export function Entity<Entity extends StateModel<Entity>>() {
  return {
    State<Ids extends IdsOf<Entity>>(stateId: string, entityIdFields: Ids): EntityStateResult<Entity, Ids> {
      return {
        ...State<IEntityStateModel<Entity>>(stateId, { map: {} }),
        [getIdStringField]: (entity: Pick<DeepReadonly<Entity>, IdsUnion<Entity, Ids>>): string => {
          if(Array.isArray(entityIdFields))
            return entityIdFields.map(entityIdField => getFieldId(entity, entityIdField)).join('|');
          return getFieldId(entity, entityIdFields);
        }
      }
    },
    SelectorClass<Ids extends IdsOf<Entity>>(state: EntityStateResult<Entity, Ids>, Base: { new(...args: any[]): any }=class{}) {
      class EntitySelector extends Base {
        static getIdString = createSelector(
          () => (...args: Parameters<typeof state['getIdString']>) => state.getIdString(...args),
        )

        static getByIdString = createSelector(
          state.selectors.map.selector,
          map => (id: string | null | undefined) => id == null ? null : map[id] ?? null,
        );

        static getById = createSelector(
          EntitySelector.getIdString,
          EntitySelector.getByIdString,
          (getId, getByIdString) => (...args: Parameters<typeof state['getIdString']>) => getByIdString(getId(...args))
        )

        static getIds = createSelector(
          state.selectors.map.selector,
          map => Object.keys(map),
        );

        static getList = createSelector(
          state.selectors.map.selector,
          map => Object.values(map),
        );
      }
      return EntitySelector;
    },
    Facade<
      Ids extends IdsOf<Entity>,
      ActionClasses extends IActionClassByName,
      StateClass extends EntityStateResult<Entity, Ids>,
      SelectorClasses extends ISelectorClass[]
    >(
      store: Store,
      actionClasses: ActionClasses,
      state: StateClass,
      ...selectorClasses: SelectorClasses
    ): IEntityFacade<Entity, Ids, ActionClasses, StateClass, SelectorClasses> {
      return {
        ...Facade(store, actionClasses, { state }, ...selectorClasses),
        [addEntitiesField]: (entities: DeepReadonly<Entity[]>) => {
          const patchObj = entities.reduce((acc, entity) => {
            const id = state[getIdStringField](entity as DeepReadonly<Entity>);
            acc[id] = entity;
            return acc;
          }, {} as Record<string, DeepReadonly<Entity>>);
          return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
        },
        [removeEntitiesField]: (entities: DeepReadonly<Entity[]>) => {
          const patchObj = entities.reduce((acc, entity) => {
            const id = state[getIdStringField](entity as DeepReadonly<Entity>);
            acc[id] = DeleteProperty;
            return acc;
          }, {} as Record<string, typeof DeleteProperty>);
          return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
        },
        [removeIdsField]: (ids: string[]) => {
          const patchObj = ids.reduce((acc, id) => {
            acc[id] = DeleteProperty;
            return acc;
          }, {} as Record<string, typeof DeleteProperty>);
          return store.dispatch(state.operatorAction, patch({ map: patch(patchObj) }) as any)
        },
        [patchEntityField]: (entityId: string, patchObj: DeepReadonly<Patch<Entity>>) => {
          return store.dispatch(state.operatorAction, patch({ map: patch({ [entityId]: patch(patchObj) }) }) as any)
        }
      };
    },
  }
}