export type TReplacementSource = {
  signature: string
  barcode: string
  owner: string
  mutation: string
  mutationEdition: string
}

export type TTemplateIssues = {
  missingPages: boolean // Chybějící strany
  damagedPages: boolean // Poškozené strany
  illegiblyBound: boolean // Nečitelně svázáno
  missingSpecimen: boolean // Chybějící číslo
  censored: boolean // Cenzurování
  degradation: boolean // Degradace papíru
}

export type TScanTemplateSettings = {
  issues: TTemplateIssues
  replacementSources: TReplacementSource[]
}

export type TReplacement = TReplacementSource & {
  pages: string
}

export const emptyReplacement: TReplacement = {
  pages: 'všechny',
  barcode: '',
  mutation: '',
  mutationEdition: '',
  owner: '',
  signature: '',
}

export const defaultScanSettings: TScanTemplateSettings = {
  issues: {
    missingPages: true,
    damagedPages: false,
    illegiblyBound: false,
    missingSpecimen: false,
    censored: false,
    degradation: false,
  },
  replacementSources: [],
}
