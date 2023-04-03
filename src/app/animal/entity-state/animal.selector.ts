import { createSelector } from "src/app/state-management/core/selector";
import { AnimalEntity } from "../shared/animal.model";
import { AnimalState } from "./animal.state";

export class AnimalSelector extends AnimalEntity.SelectorClass(AnimalState) {  
  static getFirstAnimal = createSelector(
    AnimalSelector.getList,
    animals => animals[0],
  );

  static getAnimalString = createSelector(
    AnimalSelector.getList,
    animals => animals.map(o => o.name).join(', '),
  );
}
