import { z } from 'zod'
import { TemplateState } from './templateStateSchema'
import { mainReplacementSchema, replacementSchema } from './commonSchemas'
import { VolumeSchema } from '@/schema/volume'

export const TemplateSpecimenRefSchema = z.object({
  id: z.string(),
  number: z.string().nullish(),
  attachmentNumber: z.string().nullish(),
  publicationDate: z.string().nullish(),
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
  specimen: TemplateSpecimenRefSchema,
  mainScan: MainScanSchema,
  pageReplacements: z.array(replacementSchema),
  note: z.string().optional(),
})

export const TemplateSchema = z.object({
  state: z.nativeEnum(TemplateState),
  primaryVolume: VolumeSchema,
  items: z.array(TemplateItemSchema),
})

export type TTemplateSpecimenRef = z.infer<typeof TemplateSpecimenRefSchema>
export type TMainScanPrimary = z.infer<typeof PrimaryMainScanSchema>
export type TMainScanReplacement = z.infer<typeof ReplacementMainScanSchema>
export type TMainScan = z.infer<typeof MainScanSchema>
export type TTemplateItem = z.infer<typeof TemplateItemSchema>
export type TTemplateItemWithFormIndex = {
  item: TTemplateItem
  formIndex: number
}
export type TTemplate = z.infer<typeof TemplateSchema>
