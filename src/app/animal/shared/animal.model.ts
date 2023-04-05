import { Entity } from "src/app/state-management/core/entity";

export interface Animal {
  name: string
  colors: AnimalColor[]
  hasClaws: boolean
  hasHooves: boolean
}

export enum AnimalColor {
  Red='red',
  Yellow='yellow',
  Green='green',
  Brown='brown',
  Black='black',
  White='white',
}

export const AnimalEntity = Entity<Animal>();