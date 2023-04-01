import { Injectable } from "@angular/core";
import { Store } from "src/app/state-management/core/store";
import { AnimalFacade } from "../entity-state/animal.facade";
import { AnimalFormSetNameConflict, AnimalFormSubmit } from "./animal-form.actions";
import { AnimalFormFacade } from "./animal-form.facade";

@Injectable({ providedIn: 'root' })
export class AnimalFormHandler {
  constructor(
    store: Store,
    animalFormFacade: AnimalFormFacade,
    animalFacade: AnimalFacade
  ) {
    store.addListener(
      AnimalFormSetNameConflict,
      () => animalFormFacade.state.errors.patch({ nameConflict: 'there was a name conflict' }),
    )
    
    store.addListener(
      AnimalFormSubmit,
      async () => {
        await animalFormFacade.state.submitted.set(true).toPromise();

        if(!animalFormFacade.isValid.value)
          return;
        
        await animalFacade.addEntities([{
          name: animalFormFacade.state.name.select$.value,
          colors: animalFormFacade.state.colors.select$.value,
          hasClaws: animalFormFacade.state.hasClaws.select$.value,
          hasHooves: animalFormFacade.state.hasHooves.select$.value,
        }]).toPromise();

        await animalFormFacade.state.reset().toPromise();
      },
    )
  }
}