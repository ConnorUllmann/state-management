import { Injectable } from "@angular/core";
import { FacadeClass } from "src/app/state-management/angular/facade-class";
import { AnimalFormSetNameConflict, AnimalFormSubmit } from "./animal-form.actions";
import { AnimalFormSelector } from "./animal-form.selector";
import { AnimalFormState } from "./animal-form.state";

@Injectable({ providedIn: 'root' })
export class AnimalFormFacade extends FacadeClass(
  {
    setNameConflict: AnimalFormSetNameConflict,
    submit: AnimalFormSubmit,
  },
  {
    state: AnimalFormState,
  },
  AnimalFormSelector
) {}
