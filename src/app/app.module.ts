import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AnimalHandler } from './animal/entity-state/animal.handler';
import { AnimalState } from './animal/entity-state/animal.state';
import { AnimalFormHandler } from './animal/form-state/animal-form.handler';
import { AnimalFormState } from './animal/form-state/animal-form.state';
import { AppComponent } from './app.component';
import { StoreModule } from './state-management/angular/store.module';
import { Store } from './state-management/core/store';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,

    StoreModule.forRoot({
      store: new Store(true),
      states: [
        AnimalState,
        AnimalFormState,
      ]
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  // TODO: find a way to remove these... they're required in order to instantiate the dependencies
  constructor(
    animalHandler: AnimalHandler,
    animalFormHandler: AnimalFormHandler,
  ) {}
}
