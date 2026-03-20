import { z } from 'zod'
import { TemplateState } from './templateStateSchema'
import { VolumeSchema } from '../../../schema/volume'

export const TemplateReplacementSchema = z.object({
  pages: z.string(),
  sourceVolumeId: z.string().optional(),
  isUnreplaceable: z.boolean(),
  isWaitingForRescan: z.boolean(),
})

export const TemplateItemSchema = z.object({
  specimenNumber: z.string(),
  specimenId: z.string().optional(),
  usePrimaryVolume: z.boolean(),
  sourceVolumeId: z.string().optional(),
  replacements: z.array(TemplateReplacementSchema),
  note: z.string().optional(),
})

export const TemplateSchema = z.object({
  state: z.nativeEnum(TemplateState),
  primaryVolume: VolumeSchema,
  items: z.array(TemplateItemSchema),
})

export type TTemplateReplacement = z.infer<typeof TemplateReplacementSchema>
export type TTemplateItem = z.infer<typeof TemplateItemSchema>
export type TTemplate = z.infer<typeof TemplateSchema>
