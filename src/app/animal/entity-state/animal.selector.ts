import { DeepClone } from "app/state-management/core/deep-utils";
import { createSelector } from "app/state-management/core/selector";
import { Animal } from "../shared/animal.model";
import { AnimalState } from "./animal.state";

export class AnimalSelector {
  static getAnimals = createSelector(
    AnimalState.selectors.map.selector,
    animalByName => Object.values(animalByName),
  );
  
  static getFirstAnimal = createSelector(
    AnimalSelector.getAnimals,
    animals => DeepClone<Animal>(animals[0]!),
  );

  static getAnimalString = createSelector(
    AnimalSelector.getAnimals,
    animals => animals.map(o => o.name).join(', '),
  );
}
