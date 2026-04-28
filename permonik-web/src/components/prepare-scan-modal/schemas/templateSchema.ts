import { z } from 'zod'
import { TemplateState } from './templateStateSchema'
import { replacementSchema } from './commonSchemas'
import { VolumeSchema } from '@/schema/volume'

export const TemplateSpecimenRefSchema = z.object({
  id: z.string(),
  number: z.string().nullish(),
  attachmentNumber: z.string().nullish(),
  publicationDate: z.string().nullish(),
  numExists: z.boolean(),
  numMissing: z.boolean(),
})

export const TemplateItemSchema = z.object({
  specimen: TemplateSpecimenRefSchema,
  locked: z.boolean(),
  visible: z.boolean().optional(),
  usePrimaryVolume: z.boolean(),
  replacement: replacementSchema.nullish(),
  pageReplacements: z.array(replacementSchema),
  note: z.string().optional(),
})

export const TemplateSchema = z.object({
  state: z.nativeEnum(TemplateState),
  primaryVolume: VolumeSchema,
  items: z.array(TemplateItemSchema),
})

export type TTemplateSpecimenRef = z.infer<typeof TemplateSpecimenRefSchema>
export type TTemplateItem = z.infer<typeof TemplateItemSchema>
export type TTemplateItemWithFormIndex = {
  item: TTemplateItem
  formIndex: number
}
export type TTemplate = z.infer<typeof TemplateSchema>
