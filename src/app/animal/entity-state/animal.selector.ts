import { createSelector } from "src/app/state-management/core/selector";
import { AnimalState } from "./animal.state";

export class AnimalSelector {
  static getAnimals = createSelector(
    AnimalState.selectors.map.selector,
    animalByName => Object.values(animalByName),
  );
  
  static getFirstAnimal = createSelector(
    AnimalSelector.getAnimals,
    animals => animals[0],
  );

  static getAnimalString = createSelector(
    AnimalSelector.getAnimals,
    animals => animals.map(o => o.name).join(', '),
  );
}
