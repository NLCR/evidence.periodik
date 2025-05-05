import { z } from 'zod'
import {
  SpecimenDamageTypesFacet,
  SpecimenFacetSchema,
  SpecimenSchema,
} from './specimen'
import { AuditableSchema } from './common'
import i18next from '../i18next'

export const VolumePeriodicityDaysSchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

export const VolumePeriodicitySchema = z.object({
  numExists: z.boolean(),
  isAttachment: z.boolean(),
  editionId: z.string().length(36),
  day: VolumePeriodicityDaysSchema,
  pagesCount: z.number(),
  name: z.string(),
  subName: z.string(),
})

export const EditableVolumePeriodicitySchema = z.object({
  numExists: z.boolean(),
  isAttachment: z.boolean(),
  editionId: z.string().nullable(),
  day: VolumePeriodicityDaysSchema,
  pagesCount: z.number().or(z.string()),
  name: z.string(),
  subName: z.string(),
  duplicated: z.boolean().optional(),
})

export const VolumeSchema = AuditableSchema.extend({
  id: z.string().length(36),
  barCode: z.string().min(1, i18next.t('schema.bar_code_min_length')),
  dateFrom: z.string().min(1, i18next.t('schema.date_from_min_length')),
  dateTo: z.string().min(1, i18next.t('schema.date_to_min_length')),
  metaTitleId: z.string().length(36, i18next.t('schema.meta_title_empty')),
  subName: z.string(),
  mutationId: z.string().length(36, i18next.t('schema.mutation_empty')),
  periodicity: VolumePeriodicitySchema.array(),
  firstNumber: z.number().min(0, i18next.t('schema.first_number_min')),
  lastNumber: z.number().min(0, i18next.t('schema.last_number_min')),
  note: z.string(),
  showAttachmentsAtTheEnd: z.boolean(),
  signature: z.string(),
  ownerId: z.string().length(36, i18next.t('schema.owner_empty')),
  year: z.number().min(0, i18next.t('schema.year_min')),
  mutationMark: z.string(),
})

export const EditableVolumeSchema = AuditableSchema.extend({
  id: z.string(),
  barCode: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  metaTitleId: z.string(),
  subName: z.string(),
  mutationId: z.string(),
  periodicity: EditableVolumePeriodicitySchema.array(),
  firstNumber: z.string().or(z.number()).optional(),
  lastNumber: z.string().or(z.number()).optional(),
  note: z.string(),
  showAttachmentsAtTheEnd: z.boolean(),
  signature: z.string(),
  ownerId: z.string(),
  year: z.string().or(z.number()).optional(),
  mutationMark: z.string(),
})

// for final check before sending request to BE
export const CreatableVolumeSchema = VolumeSchema.partial({ id: true })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VolumeDetailSchema = z.object({
  volume: VolumeSchema,
  specimens: SpecimenSchema.array(),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VolumeOverviewStatsSchema = z.object({
  metaTitleName: z.string(),
  ownerId: z.string(),
  signature: z.string(),
  barCode: z.string(),
  publicationDayMin: z.string().nullable(),
  publicationDayMax: z.string().nullable(),
  pagesCount: z.string().nullable(),
  mutationIds: SpecimenFacetSchema.array(),
  mutationMarks: SpecimenFacetSchema.array(),
  editionIds: SpecimenFacetSchema.array(),
  damageTypes: SpecimenDamageTypesFacet.array(),
  publicationDayRanges: SpecimenFacetSchema.array(),
  specimens: SpecimenSchema.array(),
})

export type TVolumePeriodicityDays = z.infer<typeof VolumePeriodicityDaysSchema>
export type TVolumePeriodicity = z.infer<typeof VolumePeriodicitySchema>
export type TEditableVolumePeriodicity = z.infer<
  typeof EditableVolumePeriodicitySchema
>
export type TVolume = z.infer<typeof VolumeSchema>
export type TEditableVolume = z.infer<typeof EditableVolumeSchema>
export type TCreatableVolume = z.infer<typeof CreatableVolumeSchema>
export type TVolumeDetail = z.infer<typeof VolumeDetailSchema>
export type TVolumeOverviewStats = z.infer<typeof VolumeOverviewStatsSchema>
