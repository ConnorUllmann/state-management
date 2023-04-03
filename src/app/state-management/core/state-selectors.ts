import { BehaviorSubject } from "rxjs";
import { StateSelectorField, stateSelectorProperty } from "./models/state-selectors.model";
import { StateModel } from "./models/state.model";
import { createSelector, ISelectorParent, SelectorFn } from "./selector";

type StateSelectorProxy<Model> = Partial<Record<keyof Model, StateSelectorField<Model>>> & { selector: SelectorFn<any> | null }

function createStateSelectorsInternal<Model extends StateModel<Model>>(parent: ISelectorParent<Model>, key: keyof Model | null): StateSelectorField<Model> {
  const obj = new Proxy(
    { selector: null } as StateSelectorProxy<Model>,
    {
      get(target: StateSelectorProxy<Model>, prop: keyof Model) {
        if(!target.selector)
          target.selector = createSelector(parent, key == null ? o => o : o => o?.[key]);
        
        if(prop === stateSelectorProperty)
          return target.selector;
        else {
          return (target as Partial<Record<keyof Model, StateSelectorField<Model>>>)[prop] ??= createStateSelectorsInternal(target.selector, prop);
        }
      }
    } as ProxyHandler<StateSelectorProxy<Model>>
  );
  return obj as StateSelectorField<Model>;
}

export function createStateSelectors<Model extends StateModel<Model>>(parent: BehaviorSubject<Model>): StateSelectorField<Model> {
  return createStateSelectorsInternal(parent, null);
}