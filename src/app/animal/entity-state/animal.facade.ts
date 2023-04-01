import { Injectable } from "@angular/core";
import { EntityFacadeClass } from "src/app/state-management/angular/entity-facade-class";
import { FetchAnimals } from "./animal.actions";
import { AnimalSelector } from "./animal.selector";
import { AnimalState } from "./animal.state";

@Injectable({ providedIn: 'root' })
export class AnimalFacade extends EntityFacadeClass(
  {
    fetchAnimals: FetchAnimals,
  },
  AnimalState,
  AnimalSelector
) {}
