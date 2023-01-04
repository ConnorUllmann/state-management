import { DeepEquals } from "app/state-management/core/deep-utils";
import { createSelector } from "app/state-management/core/selector";
import { AnimalFormState } from "./animal-form.state";

export class AnimalFormSelector {
  static isValid = createSelector(
    AnimalFormState.selectors.name.selector,
    AnimalFormState.selectors.errors.nameConflict.selector,
    (name, nameConflict) => name.length > 0 && nameConflict == null,
  );

  static isDirty = createSelector(
    AnimalFormState.selectors.name.selector,
    AnimalFormState.selectors.colors.selector,
    AnimalFormState.selectors.hasClaws.selector,
    AnimalFormState.selectors.hasHooves.selector,
    (name, colors, hasClaws, hasHooves) => name !== AnimalFormState.initialData.name || 
      !DeepEquals(colors, AnimalFormState.initialData.colors) || 
      hasClaws !== AnimalFormState.initialData.hasClaws || 
      hasHooves !== AnimalFormState.initialData.hasHooves,
  )
}