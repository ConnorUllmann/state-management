import { State } from "app/state-management/core/state";
import { AnimalFormStateModel } from "./animal-form-state.model";

export const AnimalFormState = State<AnimalFormStateModel>(
  'AnimalForm',
  {
    submitted: false,
    name: '',
    colors: [],
    hasClaws: false,
    hasHooves: false,
    errors: {
      nameConflict: null,
      unexpected: null,
    }
  },
)