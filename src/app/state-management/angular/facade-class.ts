import { Injectable } from "@angular/core";
import { Facade, IActionClassByName, IFacade, IStateClassByName } from "../core/facade";
import { ISelectorClass } from "../core/selector";
import { Store } from "../core/store";

export function FacadeClass<
  ActionClasses extends IActionClassByName,
  StateClasses extends IStateClassByName,
  SelectorClasses extends ISelectorClass[]
>(
  actionClasses: ActionClasses,
  states: StateClasses,
  ...selectorClasses: SelectorClasses
) {
  @Injectable()
  class FacadeClass {
    constructor(store: Store) {
      const facade = Facade(
        store,
        actionClasses,
        states,
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
  return FacadeClass as unknown as { new(store: Store): IFacade<ActionClasses, StateClasses, SelectorClasses> };
}