import { DeepReadonly } from "../deep-utils";
import { IState, StateModel } from "../models/state.model";

export type IEntityStateModel<Entity extends StateModel<Entity>> = {
  map: Record<string, Entity>
}

export const getIdStringField = 'getIdString' as const;
export type IEntityState<Entity extends StateModel<Entity>, IdsUnion extends keyof Entity> = IState<StateModel<IEntityStateModel<Entity>>> & {
  readonly getIdString: (entity: Pick<DeepReadonly<Entity>, IdsUnion>) => string
}

