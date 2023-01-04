import { ModuleWithProviders, NgModule } from "@angular/core";
import { IState } from "../core/models/state.model";
import { Store } from "../core/store";

@NgModule({})
export class StoreModule {
  static forRoot({ store, states }: { store: Store, states: Readonly<IState<any>>[] }): ModuleWithProviders<StoreModule> {
    store.addStates(...states);
    return {
      ngModule: StoreModule,
      providers: [
        { provide: Store, useValue: store }
      ]
    }
  }
}