import { Injectable } from "@angular/core";
import { EntityFacade, IEntityFacade, ToStateClass } from "../core/entity-state/entity-facade";
import { IActionClassByName } from "../core/facade";
import { ISelectorClass } from "../core/selector";
import { Store } from "../core/store";

export function EntityFacadeClass<
ActionClasses extends IActionClassByName,
StateClass,
SelectorClasses extends ISelectorClass[]
>(
  actionClasses: ActionClasses,
  state: ToStateClass<StateClass>,
  ...selectorClasses: SelectorClasses
) {
  @Injectable()
  class EntityFacadeClass {
    constructor(store: Store) {
      const facade = EntityFacade(
        store,
        actionClasses,
        state,
        ...selectorClasses,
      );
  
      for(const key in facade) {
        Object.defineProperty(
          this,
          key,
          Object.getOwnPropertyDescriptor(facade, key)!
        )
      }
    }
  }
  return EntityFacadeClass as unknown as { new(store: Store): IEntityFacade<ActionClasses, typeof state, SelectorClasses> };
}