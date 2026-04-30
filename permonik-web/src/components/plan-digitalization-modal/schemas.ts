import { TMutationMark } from '../../utils/mutationMark'

export type PlanDigitalizationResponse = {
  year: string
  libraries: {
    shorthand: string
    id: string
    volumes: {
      id: string
      number: string
      fillIndex: number
    }[]
  }[]
}[]

export type PlanDigitalizationFilters = {
  yearFrom: string
  yearTo: string
  mutationId: string
  mutationalEdition: TMutationMark
}
