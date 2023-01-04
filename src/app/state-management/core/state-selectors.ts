import { StateSelectorField, StateSelectorNode, stateSelectorProperty } from "./models/state-selectors.model";
import { IState, StateModel } from "./models/state.model";
import { createSelector } from "./selector";

const addSelectProperty = (obj: any, selectorFn: any) => Object.defineProperty(
    obj,
    stateSelectorProperty,
    {
      configurable: false,
      enumerable: true,
      writable: false,
      value: selectorFn,
    }
  )

export function createStateSelectors<Model extends StateModel<Model>>(state: Readonly<Pick<IState<Model>, 'initialData' | 'data$'>>): StateSelectorField<Model> {
  const obj = {};
  const selectorFn = createSelector(state.data$, state => state);
  addSelectProperty(obj, selectorFn);
  recurse(obj, state.initialData);
  return obj as StateSelectorField<Model>;
}

function recurse<Parent>(obj: any, objToTraverse: Parent) {
  for(const key in objToTraverse) {
    const prop = objToTraverse[key];

    obj[key] = {};

    const selectorFn = createSelector(obj.selector, value => value[key]);
    addSelectProperty(obj[key], selectorFn);
    
    if(!Array.isArray(prop) && typeof prop === 'object')
      recurse(obj[key], prop);
  }
  return obj as StateSelectorNode<Parent>;
}