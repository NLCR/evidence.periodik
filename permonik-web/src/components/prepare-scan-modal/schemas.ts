export type TReplacementSource = {
  id: string | undefined
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

export type TReplacementSourceParameters = {
  metatitle: boolean
  mutation: boolean
  mutationalEdition: boolean
  owner: boolean
  timeOverlap: boolean
}

export type TScanTemplateSettings = {
  issues: TTemplateIssues
  replacementSourcesParameters: TReplacementSourceParameters
  replacementSources: TReplacementSource[]
  // read only fill index of primary volume
  primaryVolumeFillIndex: number
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

export const defaultScanSettings: TScanTemplateSettings = {
  issues: {
    missingPages: true,
    damagedPages: false,
    illegiblyBound: false,
    missingSpecimen: true,
    censored: false,
    degradation: false,
  },
  replacementSourcesParameters: {
    metatitle: true,
    mutation: false,
    mutationalEdition: false,
    owner: false,
    timeOverlap: true,
  },
  replacementSources: [emptyReplacement],
  primaryVolumeFillIndex: 88732,
}
