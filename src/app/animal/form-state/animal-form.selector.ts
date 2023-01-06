import { createSelector } from "app/state-management/core/selector";
import { AnimalFormState } from "./animal-form.state";

export class AnimalFormSelector {
  static isValid = createSelector(
    AnimalFormState.selectors.name.selector,
    AnimalFormState.selectors.colors.selector,
    AnimalFormState.selectors.errors.nameConflict.selector,
    (name, colors, nameConflict) => name.length > 0 && colors.length > 0 && nameConflict == null,
  );
}