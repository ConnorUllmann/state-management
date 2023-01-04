import { BehaviorSubject } from "rxjs";
import { DeepClone, DeepEquals, DeepReadonly } from "./deep-utils";
import { IListener } from "./models/listener.model";
import { IState, StateModel } from "./models/state.model";
import { isOperator, Operator } from "./operators";
import { createStateSelectors } from "./state-selectors";

export function State<Model extends StateModel<Model>>(stateId: string, initialData: DeepReadonly<Model>): Readonly<IState<Model>> {
  initialData = DeepClone<DeepReadonly<Model>>(initialData)
  const data$ = new BehaviorSubject(DeepClone(initialData));

  const set = (value: Model): void => {
    if(obj.data$.value !== value && !DeepEquals(obj.data$.value, value))
      obj.data$.next(value);
  }

  const applyOperator = (operator: Model | Operator<Model>): Model => isOperator<Model>(operator) ? operator(obj.data$.value) : operator;

  const operatorAction = class {
    static readonly actionId = `[${stateId}] SetState`
    constructor(public value: Operator<Model>) {}
  }

  const operatorListener: IListener<InstanceType<typeof operatorAction>> = ({ value }) => set(applyOperator(value))

  const baseState = {
    stateId,
    initialData,
    operatorAction,
    operatorListener,
    data$,
  }

  const selectors = createStateSelectors(baseState);
  
  const obj: Readonly<IState<Model>> = {
    ...baseState,
    selectors,
  }

  return obj;
}
