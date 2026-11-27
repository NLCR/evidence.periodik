import { z } from 'zod'
import i18next from '@/i18next'
import { createYearSchema } from '@/schema/common'
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
            barCode: z.string(),
            fillIndex: z.number(),
            monthFrom: z.number().int().min(1).max(12),
            monthTo: z.number().int().min(1).max(12),
            pagesCount: z.number().int(),
            continuesFromPreviousYear: z.boolean(),
            continuesIntoNextYear: z.boolean(),
          })
        ),
      })
    ),
  })
)

export type PlanDigitalizationResponse = z.infer<
  typeof PlanDigitalizationResponseSchema
>

export const createPlanDigitalizationFiltersSchema = (
  minYear: number | undefined,
  maxYear: number | undefined
) => {
  const yearSchema = createYearSchema(minYear, maxYear)

  return z
    .object({
      metaTitleId: z.string(),
      yearFrom: yearSchema,
      yearTo: yearSchema,
      mutation: MutationSchema.nullable(),
      mutationalEdition: MutationMarkSchema.nullable(),
    })
    .refine(({ yearFrom, yearTo }) => yearFrom <= yearTo, {
      path: ['yearTo'],
      error: () => i18next.t('plan_digitalization_modal.year_range_invalid'),
    })
}

export type PlanDigitalizationFilters = z.infer<
  ReturnType<typeof createPlanDigitalizationFiltersSchema>
>

export const PlanningFacetsSchema = z.object({
  mutations: z.array(
    z.object({
      item: MutationSchema,
      count: z.number().int().positive(),
    })
  ),
  mutationalEditions: z.array(
    z.object({
      item: MutationMarkSchema,
      count: z.number().int().positive(),
    })
  ),
})
