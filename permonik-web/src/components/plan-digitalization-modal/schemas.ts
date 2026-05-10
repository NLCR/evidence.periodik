import { z } from 'zod'
import { MutationSchema } from '@/schema/mutation'
import { MutationMarkSchema } from '../../utils/mutationMark'

export const PlanDigitalizationResponseSchema = z.array(
  z.object({
    year: z.string(),
    libraries: z.array(
      z.object({
        id: z.string(),
        shorthand: z.string(),
        volumes: z.array(
          z.object({
            id: z.string(),
            number: z.string(),
            fillIndex: z.number(),
          })
        ),
      })
    ),
  })
)

export type PlanDigitalizationResponse = z.infer<
  typeof PlanDigitalizationResponseSchema
>

export const PlanDigitalizationFiltersSchema = z.object({
  yearFrom: z.string(),
  yearTo: z.string(),
  mutation: MutationSchema.nullable(),
  mutationalEdition: MutationMarkSchema,
})

export type PlanDigitalizationFilters = z.infer<
  typeof PlanDigitalizationFiltersSchema
>
