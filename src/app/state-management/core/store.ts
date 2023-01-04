import { from, isObservable, Observable, of } from "rxjs";
import { DeepDiff } from "./deep-utils";
import { ActionStatus, ActionStreamPayload, IActionClass } from "./models/action.model";
import { IListener } from "./models/listener.model";
import { IState } from "./models/state.model";

let logIndexCounter = 0;

export class Store {
  private listenersByActionId: Record<string, IListener<any>[]> = {};
  private stateByStateId: Record<string, Readonly<IState<any>>> = {};

  constructor(public isLogging = false) {}

  dispatch: <T extends IActionClass<any>>(actionClass: T, ...params: ConstructorParameters<T>)  => Observable<void> = () => of();
  private actions$ = new Observable<ActionStreamPayload<object>>(subscriber => {
    this.dispatch = <T extends IActionClass<any>>(actionClass: T, ...params: ConstructorParameters<T>) => {
      return from(new Promise<void>(async resolve => {
        const isLogging = this.isLogging;

        const previousStateByStateId = isLogging
          ? Object.keys(this.stateByStateId).reduce((acc, o) => {
            acc[o] = this.stateByStateId[o]!.data$.value;
            return acc;
          }, {} as any)
          : null;


        const logIndex = logIndexCounter++;
        const hueDeg = (logIndex * 137.5) % 360;
        const color = `color:hsl(${hueDeg} 75% 40%);`

        if(isLogging) {
          console.group(actionClass.actionId);
          console.log(`(log ${logIndex})%c payload`, color, params);
          console.log(`(log ${logIndex})%c previous`, `font-style:italic;${color}`, previousStateByStateId);
        }

        const action = new actionClass(...params);
        subscriber.next({ status: ActionStatus.Dispatched, action });
        const listeners = this.listenersByActionId[actionClass.actionId];
        if(listeners) {
          for(const listener of listeners) {
            try {
              const listenerResult = listener(action, this);
              if(listenerResult == null) {
                continue;
              } else if(isObservable(listenerResult)) {
                await listenerResult.toPromise();
              } else {
                await listenerResult;
              }
            } catch(e) {
              console.error(e);
            }
          }
        }
        subscriber.next({ status: ActionStatus.Completed, action });

        if(isLogging) {
          const nextStateByStateId = Object.keys(this.stateByStateId).reduce((acc, o) => {
            acc[o] = this.stateByStateId[o]!.data$.value
            return acc;
          }, {} as any);
          const diffByStateId = Object.keys(nextStateByStateId).reduce((acc, stateId) => {
            acc[stateId] = DeepDiff(nextStateByStateId[stateId], previousStateByStateId[stateId] ?? {})
            return acc;
          }, {} as any);
          console.log(`(log ${logIndex})%c next`, `font-style:italic;${color}`, nextStateByStateId);
          console.log(`(log ${logIndex})%c diff`, `font-style:italic;${color}`, diffByStateId);
          console.groupEnd();
        }
        
        resolve();
      }));
    };
  });
  private subscription = this.actions$.subscribe()

  private addListenerForSingleAction<T extends IActionClass<any>>({ actionId }: T, listener: IListener<InstanceType<T>>) {
    if(!(actionId in this.listenersByActionId))
      this.listenersByActionId[actionId] = [];
    this.listenersByActionId[actionId]!.push(listener);
  }

  addListener<T extends [IActionClass<any>, ...IActionClass<any>[]]>(...args: [...actionClasses: T, listener: IListener<InstanceType<T[number]>>]) {
    const actionClasses = args.slice(0, -1) as T;
    const listener = args[args.length-1] as IListener<InstanceType<T[number]>>;
    for(const actionClass of actionClasses)
      this.addListenerForSingleAction(actionClass, listener);
  }

  addStates(...states: Readonly<IState<any>>[]): this {
    for(const state of states) {
      if(state.stateId in this.stateByStateId)
        throw new Error(`A state with ID "${state.stateId}" is already present in this store.`)
      this.stateByStateId[state.stateId] = state;
      this.addListener(state.operatorAction, state.operatorListener)
    }
    return this;
  }

  destroy() {
    this.subscription.unsubscribe();
  }
}
