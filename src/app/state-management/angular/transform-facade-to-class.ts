import { Injectable } from "@angular/core";
import { Store } from "../core/store";

export function TransformFacadeToClass<T>(getObj: (store: Store) => T): { new(store: Store): T } {
  @Injectable()
  class ObjClass {
    constructor(store: Store) {
      const obj = getObj(store);
      for(const key in obj) {
        Object.defineProperty(
          this,
          key,
          Object.getOwnPropertyDescriptor(obj, key)!
        )
      }
    }
  }
  return ObjClass as any;
}
