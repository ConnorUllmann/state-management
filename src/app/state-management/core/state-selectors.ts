import { BehaviorSubject } from "rxjs";
import { StateSelectorField, stateSelectorProperty } from "./models/state-selectors.model";
import { StateModel } from "./models/state.model";
import { createSelector, ISelectorParent, SelectorFn } from "./selector";

export function createStateSelectors<Model extends StateModel<Model>>(parent: BehaviorSubject<Model>): StateSelectorField<Model> {
  return createStateSelectorsInternal(parent, null);
}

export function createStateSelectorsInternal<Model extends StateModel<Model>>(parent: ISelectorParent<Model>, key: keyof Model | null): StateSelectorField<Model> {
  let selectorFn: SelectorFn<any> | null = null;
  let fields: Partial<Record<keyof Model, StateSelectorField<Model>>> = {};

  const obj = new Proxy(
    {} as unknown as StateSelectorField<Model>,
    {
      get(_target: any, prop: keyof Model) {
        if(!selectorFn)
          selectorFn = createSelector(parent, key == null ? obj => obj : obj => obj?.[key]);
        
        if(prop === stateSelectorProperty)
          return selectorFn;
        else {
          if(!(prop in fields))
            fields[prop] = createStateSelectorsInternal(selectorFn, prop);
          return fields[prop];
        }
      }
    } as ProxyHandler<StateSelectorField<Model>>
  );
  return obj as StateSelectorField<Model>;
}