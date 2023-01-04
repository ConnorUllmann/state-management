import { AnimalColor } from "../shared/animal.model"

export interface AnimalFormStateModel {
  submitted: boolean
  name: string
  colors: AnimalColor[]
  hasClaws: boolean
  hasHooves: boolean
  errors: {
    nameConflict: string | null
    unexpected: string | null
  }
}