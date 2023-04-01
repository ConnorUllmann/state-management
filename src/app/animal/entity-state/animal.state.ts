import { Entity } from "src/app/state-management/core/entity-state/entity-state";
import { Animal } from "../shared/animal.model";

export const AnimalState = Entity<Animal>().State('Animal', 'name');