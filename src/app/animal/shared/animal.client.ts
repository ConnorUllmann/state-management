import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { Animal, AnimalColor } from "./animal.model";

@Injectable({ providedIn: 'root' })
export class AnimalClient {
  getAnimals(): Observable<Animal[]> {
    return from(
      new Promise<Animal[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              name: 'Horse',
              colors: [AnimalColor.Brown],
              hasClaws: false,
              hasHooves: true,
            },
            {
              name: 'Zebra',
              colors: [AnimalColor.Black, AnimalColor.White],
              hasClaws: false,
              hasHooves: true,
            },
            {
              name: 'Bumblebee',
              colors: [AnimalColor.Black, AnimalColor.Yellow],
              hasClaws: false,
              hasHooves: false,
            },
            {
              name: 'Chicken',
              colors: [AnimalColor.White],
              hasClaws: true,
              hasHooves: false,
            },
            {
              name: 'Panther',
              colors: [AnimalColor.Black],
              hasClaws: true,
              hasHooves: false,
            },
            {
              name: 'Questing Beast',
              colors: [AnimalColor.Green, AnimalColor.Yellow],
              hasClaws: true,
              hasHooves: true,
            }
          ]);
        }, 1000)
      })
    )
  }
}