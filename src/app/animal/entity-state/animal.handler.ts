import { Injectable } from "@angular/core";
import { flatMap } from "rxjs/operators";
import { Store } from "src/app/state-management/core/store";
import { AnimalClient } from "../shared/animal.client";
import { FetchAnimals } from "./animal.actions";
import { AnimalFacade } from "./animal.facade";

@Injectable({ providedIn: 'root' })
export class AnimalHandler {
  constructor(
    store: Store,
    animalClient: AnimalClient,
    animalFacade: AnimalFacade
  ) {
    store.addListener(
      FetchAnimals,
      () => animalClient.getAnimals().pipe(flatMap(animals => animalFacade.addEntities(animals))),
    )
  }
}