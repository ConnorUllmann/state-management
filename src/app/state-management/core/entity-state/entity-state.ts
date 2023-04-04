import { StateModel } from "../models/state.model";
import { createSelector } from "../selector";
import { State } from "../state";
import { getIdStringField, IEntityState } from "./entity-state.model";

type IdProperty<T> = { [K in keyof T]: K extends string | number | boolean ? T[K] extends string | number | boolean ? K : never : never }[keyof T];

type IdsOf<Entity extends StateModel<Entity>> = IdProperty<Entity> | IdProperty<Entity>[]
type IdsUnion<Entity extends StateModel<Entity>, Ids extends IdProperty<Entity> | IdProperty<Entity>[]> = Ids extends any[] ? Ids[number] : Ids;
type EntityStateResult<Entity extends StateModel<Entity>, Ids extends IdProperty<Entity> | IdProperty<Entity>[]> = Readonly<IEntityState<Entity, IdsUnion<Entity, Ids>>>

export function Entity<Entity extends StateModel<Entity>>() {
  return {
    State<Ids extends IdsOf<Entity>>(stateId: string, entityIdFields: Ids): EntityStateResult<Entity, Ids> {
      const obj = State(stateId, { map: {} }) as IEntityState<Entity, Ids extends any[] ? Ids[number] : Ids>;
    
      const getFieldId = (entity: Entity, entityIdField: IdProperty<Entity>): string => {
        const result = entity[entityIdField];
        return typeof result === 'string' ? result : result?.toString() ?? '';
      }
    
      Object.defineProperty(
        obj,
        getIdStringField,
        {
          configurable: false,
          enumerable: true,
          writable: false,
          value: (entity: Entity): string => {
            if(Array.isArray(entityIdFields))
              return entityIdFields.map(entityIdField => getFieldId(entity, entityIdField)).join('|');
            return getFieldId(entity, entityIdFields as any);
          }
        }
      )
    
      return obj as unknown as Readonly<IEntityState<Entity, IdsUnion<Entity, Ids>>>;
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
    }
  }
}