import { z } from 'zod'
import { MutationMarkSchema } from '@/utils/mutationMark'
import { TemplateState } from './templateStateSchema'
import { mainReplacementSchema, replacementSchema } from './commonSchemas'
import { VolumeSchema } from '@/schema/volume'

const TemplateVolumeSchema = VolumeSchema.extend({
  metaTitleName: z.string(),
  mutationName: z.string(),
  ownerName: z.string(),
})

export const TemplateSpecimenSchema = z.object({
  id: z.string(),
  number: z.string().nullish(),
  attachmentNumber: z.string().nullish(),
  publicationDate: z.string().nullish(),
  mutationMark: MutationMarkSchema.nullable(),
  isAttachment: z.boolean(),
  numExists: z.boolean(),
  numMissing: z.boolean(),
})

export const PrimaryMainScanSchema = z.object({
  type: z.literal('PRIMARY'),
  locked: z.boolean(),
  visible: z.boolean(),
})

export const ReplacementMainScanSchema = z.object({
  type: z.literal('REPLACEMENT'),
  locked: z.boolean(),
  visible: z.boolean(),
  replacement: mainReplacementSchema,
})

export const MainScanSchema = z.discriminatedUnion('type', [
  PrimaryMainScanSchema,
  ReplacementMainScanSchema,
])

export const TemplateItemSchema = z.object({
  specimen: TemplateSpecimenSchema,
  mainScan: MainScanSchema,
  pageReplacements: z.array(replacementSchema),
  note: z.string().optional(),
})

export const TemplateSchema = z.object({
  id: z.string(),
  version: z.number().int().nullable(),
  state: z.nativeEnum(TemplateState),
  primaryVolume: TemplateVolumeSchema,
  replacementSourcesParameters: z.object({
    metatitle: z.boolean(),
    mutation: z.boolean(),
    mutationalEdition: z.boolean(),
    owner: z.boolean(),
    timeOverlap: z.boolean(),
  }),
  primaryVolumeFillIndex: z.number().int().min(0).max(100999),
  combinedFillIndex: z.number().int().min(0).max(100999),
  items: z.array(TemplateItemSchema),
  createdDate: z.string(),
  modifiedDate: z.string(),
})

export type TTemplateSpecimen = z.infer<typeof TemplateSpecimenSchema>
export type TTemplateVolume = z.infer<typeof TemplateVolumeSchema>
export type PrimaryMainScan = z.infer<typeof PrimaryMainScanSchema>
export type ReplacementMainScan = z.infer<typeof ReplacementMainScanSchema>
export type MainScan = z.infer<typeof MainScanSchema>
export type TTemplateItem = z.infer<typeof TemplateItemSchema>
export type TTemplateItemWithFormIndex = {
  item: TTemplateItem
  formIndex: number
}
export type TTemplate = z.infer<typeof TemplateSchema>
