import { EntityState } from "app/state-management/core/entity-state/entity-state";
import { Animal } from "../shared/animal.model";

export const AnimalState = EntityState<Animal>(
  'Animal',
  'name',
);