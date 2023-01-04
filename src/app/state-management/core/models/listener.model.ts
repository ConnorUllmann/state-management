import { Observable } from "rxjs";
import { Store } from "../store";
import { IAction } from "./action.model";

export type IListener<T> = (action: IAction<T>, store: Store) => void | Promise<void> | Observable<void>;