import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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

  searchName$ = new BehaviorSubject<string>('');
  searchedAnimal$ = combineLatest([
    this.searchName$,
    this.animalFacade.state.map.select$
  ]).pipe(map(([searchName, map]) => {
    const id = this.animalFacade.getId({ name: searchName })
    return map[id] ?? null;
  }))

  constructor(
    public animalFacade: AnimalFacade,
    public animalFormFacade: AnimalFormFacade,
  ) {}
}
