import { Entity, EntityStateResult, IdsOf } from "../core/entity";
import { IActionClassByName } from "../core/facade";
import { StateModel } from "../core/models/state.model";
import { ISelectorClass } from "../core/selector";
import { TransformFacadeToClass } from "./transform-facade-to-class";

export function EntityFacadeClass<
  Entity extends StateModel<Entity>,
  Ids extends IdsOf<Entity>,
  ActionClasses extends IActionClassByName,
  StateClass extends EntityStateResult<Entity, Ids>,
  SelectorClasses extends ISelectorClass[]
>(
  entity: { Facade: ReturnType<typeof Entity<Entity>>['Facade'] },
  actionClasses: ActionClasses,
  state: StateClass,
  ...selectorClasses: SelectorClasses
) {
  return TransformFacadeToClass(store => entity.Facade(store, actionClasses, state, ...selectorClasses));
}