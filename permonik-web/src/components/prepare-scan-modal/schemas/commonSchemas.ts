import { z } from 'zod'

export type TTemplateIssues = {
  missingPages: boolean // Chybějící strany
  damagedPages: boolean // Poškozené strany
  illegiblyBound: boolean // Nečitelně svázáno
  missingSpecimen: boolean // Chybějící číslo
  censored: boolean // Cenzurování
  degradation: boolean // Degradace papíru
}

export type TReplacementSourceParameters = {
  metatitle: boolean
  mutation: boolean
  mutationalEdition: boolean
  owner: boolean
  timeOverlap: boolean
}

export const replacementSourceSchema = z.object({
  id: z.string().nullish(),
  priority: z.number().int().positive().nullish(),
  signature: z.string().nullish(),
  owner: z.string().nullish(),
  barcode: z.string().nullish(),
  mutation: z.string().nullish(),
  mutationEdition: z.string().nullish(),
})

export const mainReplacementSchema = z.object({
  volume: replacementSourceSchema,
  pages: z.string(),
  isUnreplaceable: z.boolean(),
  isWaitingForRescan: z.boolean(),
})

export const replacementSchema = mainReplacementSchema.extend({
  locked: z.boolean(),
  visible: z.boolean(),
})

export type TReplacementSource = z.infer<typeof replacementSourceSchema>

export type TMainReplacement = z.infer<typeof mainReplacementSchema>

export type TReplacement = z.infer<typeof replacementSchema>

export const createEmptyReplacementSource = (): TReplacementSource => ({
  id: undefined,
  priority: undefined,
  barcode: '',
  mutation: '',
  mutationEdition: '',
  owner: '',
  signature: '',
})

export const createEmptyMainReplacement = (): TMainReplacement => ({
  volume: createEmptyReplacementSource(),
  pages: 'všechny',
  isUnreplaceable: false,
  isWaitingForRescan: false,
})

export const createEmptyReplacement = (): TReplacement => ({
  ...createEmptyMainReplacement(),
  locked: false,
  visible: true,
})
