import { StateModel } from "../models/state.model";
import { State } from "../state";
import { getIdField, IEntityState } from "./entity-state.model";

type StringProperty<T> = { [K in keyof T]: K extends string ? T[K] extends string ? K : never : never }[keyof T];

export function EntityState<Entity extends StateModel<Entity>>(stateId: string, entityIdFields: StringProperty<Entity> | StringProperty<Entity>[]): Readonly<IEntityState<Entity>> {
  const obj = State(stateId, { map: {} }) as IEntityState<Entity>;

  const getFieldId = (entity: Entity, entityIdField: StringProperty<Entity>): string => {
    const result = entity[entityIdField];
    return typeof result === 'string' ? result : result.toString();
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
        return getFieldId(entity, entityIdFields);
      }
    }
  )

  return obj as unknown as Readonly<IEntityState<Entity>>;
}
