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

export const replacementSchema = z.object({
  volume: replacementSourceSchema,
  pages: z.string(),
  isUnreplaceable: z.boolean(),
  isWaitingForRescan: z.boolean(),
})

export type TReplacementSource = z.infer<typeof replacementSourceSchema>

export type TReplacement = z.infer<typeof replacementSchema>

export const EMPTY_REPLACEMENT_SOURCE: TReplacementSource = {
  id: undefined,
  priority: undefined,
  barcode: '',
  mutation: '',
  mutationEdition: '',
  owner: '',
  signature: '',
}

export const EMPTY_REPLACEMENT: TReplacement = {
  volume: EMPTY_REPLACEMENT_SOURCE,
  pages: 'všechny',
  isUnreplaceable: false,
  isWaitingForRescan: false,
}
