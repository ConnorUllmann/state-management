import { Facade, IActionClassByName, IStateClassByName } from "../core/facade";
import { ISelectorClass } from "../core/selector";
import { TransformFacadeToClass } from "./transform-facade-to-class";

export function FacadeClass<
  ActionClasses extends IActionClassByName,
  StateClasses extends IStateClassByName,
  SelectorClasses extends ISelectorClass[]
>(
  actionClasses: ActionClasses,
  states: StateClasses,
  ...selectorClasses: SelectorClasses
) {
  return TransformFacadeToClass(store => Facade(store, actionClasses, states, ...selectorClasses));
}