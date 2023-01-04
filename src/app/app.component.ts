import { Component } from '@angular/core';
import { AnimalFacade } from './animal/entity-state/animal.facade';
import { AnimalFormFacade } from './animal/form-state/animal-form.facade';
import { AnimalColor } from './animal/shared/animal.model';
import { booleanToggle } from './state-management/core/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  colors = [
    AnimalColor.Red,
    AnimalColor.Yellow,
    AnimalColor.Green,
    AnimalColor.Brown,
    AnimalColor.Black,
    AnimalColor.White,
  ]

  booleanToggle = booleanToggle;

  constructor(
    public animalFacade: AnimalFacade,
    public animalFormFacade: AnimalFormFacade,
  ) {}
}
