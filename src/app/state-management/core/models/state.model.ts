import { BehaviorSubject } from "rxjs";
import { DeepReadonly } from "../deep-utils";
import { Operator } from "../operators";
import { IActionClass } from "./action.model";
import { IListener } from "./listener.model";
import { StateSelectorField } from "./state-selectors.model";

export type StateModel<T> = { [P in keyof T]-?: StateModel<Exclude<T[P], undefined | ((...args: any) => any)>> };

export type IState<Model extends StateModel<Model>> = {
  stateId: string
  initialData: DeepReadonly<Model>
  data$: BehaviorSubject<Model>
  selectors: StateSelectorField<Model>
  operatorAction: IActionClass<{ value: Operator<Model> }, [Operator<Model>]>,
  operatorListener: IListener<{ value: Operator<Model> }>
}