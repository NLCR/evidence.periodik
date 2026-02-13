export type TReplacementSource = {
  signature: string
  barcode: string
  owner: string
  mutation: string
  mutationEdition: string
}

export type TScanTemplateSettings = {
  missingPages: boolean
  damagedPages: boolean
  badBound: boolean
  replacementSources: TReplacementSource[]
}

export type TReplacement = TReplacementSource & {
  pages: string
}

export const defaultReplacement: TReplacement = {
  pages: 'všechny',
  barcode: '',
  mutation: '',
  mutationEdition: '',
  owner: '',
  signature: '',
}
