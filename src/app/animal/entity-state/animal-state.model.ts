import { Animal } from "../shared/animal.model";

export interface AnimalStateModel {
  animalByName: Record<string, Animal>
  removedAnimalCount: number
}