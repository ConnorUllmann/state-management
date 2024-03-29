import { Injectable } from "@angular/core";
import { EntityFacadeClass } from 'src/app/state-management/angular/entity-facade-class';
import { AnimalEntity } from "../shared/animal.model";
import { FetchAnimals } from "./animal.actions";
import { AnimalSelector } from "./animal.selector";
import { AnimalState } from "./animal.state";

@Injectable({ providedIn: 'root' })
export class AnimalFacade extends EntityFacadeClass(
  AnimalEntity,
  {
    fetchAnimals: FetchAnimals,
  },
  AnimalState,
  AnimalSelector
) {}
