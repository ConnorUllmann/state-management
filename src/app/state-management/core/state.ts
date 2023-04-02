import { BehaviorSubject } from "rxjs";
import { DeepClone, DeepEquals, DeepReadonly } from "./deep-utils";
import { IListener } from "./models/listener.model";
import { IState, StateModel } from "./models/state.model";
import { isOperator, Operator } from "./operators";
import { createStateSelectors } from "./state-selectors";

export function State<Model extends StateModel<Model>>(stateId: string, initialData: DeepReadonly<Model>): Readonly<IState<Model>> {
  initialData = DeepClone<DeepReadonly<Model>>(initialData)
  const data$ = new BehaviorSubject(DeepClone(initialData));

  const selectors = createStateSelectors(data$);

  const set = (value: Model): void => {
    if(state.data$.value !== value && !DeepEquals(state.data$.value, value))
      state.data$.next(value);
  }

  const applyOperator = (operator: Model | Operator<Model>): Model => isOperator<Model>(operator) ? operator(state.data$.value as DeepReadonly<Model>) : operator;

  const operatorAction = class {
    static readonly actionId = `[${stateId}] SetState`
    constructor(public value: Operator<Model>) {}
  }

  const operatorListener: IListener<InstanceType<typeof operatorAction>> = ({ value }) => set(applyOperator(value))
  
  const state: Readonly<IState<Model>> = {
    stateId,
    initialData,
    operatorAction,
    operatorListener,
    data$,
    selectors,
  }

  return state;
}
