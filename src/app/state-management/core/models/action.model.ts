export type IAction<T> = T

export interface IActionClass<T, Args extends any[]=any[]> {
  new(...args: Args): IAction<T>
  actionId: string
}

export enum ActionStatus {
  Dispatched='Dispatched',
  Completed='Completed',
}

export interface ActionStreamPayload<T extends object> {
  status: ActionStatus
  action: T
}