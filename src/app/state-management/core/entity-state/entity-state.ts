import { StateModel } from "../models/state.model";
import { State } from "../state";
import { getIdField, IEntityState } from "./entity-state.model";

type IdProperty<T> = { [K in keyof T]: K extends string | number | boolean ? T[K] extends string | number | boolean ? K : never : never }[keyof T];

export function Entity<Entity extends StateModel<Entity>>() {
  return {
    State<Ids extends IdProperty<Entity> | IdProperty<Entity>[]>(stateId: string, entityIdFields: Ids): Readonly<IEntityState<Entity, Ids extends any[] ? Ids[number] : Ids>> {
      const obj = State(stateId, { map: {} }) as IEntityState<Entity, Ids extends any[] ? Ids[number] : Ids>;
    
      const getFieldId = (entity: Entity, entityIdField: IdProperty<Entity>): string => {
        const result = entity[entityIdField];
        return typeof result === 'string' ? result : result?.toString() ?? '';
      }
    
      Object.defineProperty(
        obj,
        getIdField,
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
    
      return obj as unknown as Readonly<IEntityState<Entity, Ids extends any[] ? Ids[number] : Ids>>;
    }
  }
}