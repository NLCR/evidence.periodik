import { z } from 'zod'
import i18next from '../i18next'

export const createYearSchema = (minYear?: number, maxYear?: number) => {
  const min = Math.max(1, minYear ?? 1)
  const max = Math.min(9999, maxYear ?? 9999)

  return z
    .int({ error: () => i18next.t('schema.calendar_year_invalid') })
    .min(min, {
      error: () => i18next.t('schema.calendar_year_min', { year: min }),
    })
    .max(max, {
      error: () => i18next.t('schema.calendar_year_max', { year: max }),
    })
}

export const AuditableSchema = z
  .object({
    created: z.string().nullable(),
    createdBy: z.string().nullable(),
    updated: z.string().nullable(),
    updatedBy: z.string().nullable(),
    deleted: z.string().nullable(),
    deletedBy: z.string().nullable(),
  })
  .partial()

export type TAuditable = z.infer<typeof AuditableSchema>

export const copyAuditable = <T extends TAuditable>(input: T): TAuditable => {
  return {
    created: input.created,
    createdBy: input.createdBy,
    updated: input.updated,
    updatedBy: input.updatedBy,
    deleted: input.deleted,
    deletedBy: input.deletedBy,
  }
}
