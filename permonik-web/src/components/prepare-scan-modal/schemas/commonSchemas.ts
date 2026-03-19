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

export type TReplacementSource = {
  id: string | undefined
  signature: string
  barcode: string
  owner: string
  mutation: string
  mutationEdition: string
}

export type TReplacement = TReplacementSource & {
  pages: string
}

export const emptyReplacement: TReplacement = {
  id: undefined,
  pages: 'všechny',
  barcode: '',
  mutation: '',
  mutationEdition: '',
  owner: '',
  signature: '',
}
