import {
  TReplacementSourceParameters,
  TTemplateIssues,
  TReplacementSource,
  EMPTY_REPLACEMENT_SOURCE,
} from './commonSchemas'

export type TScanTemplateSettings = {
  issues: TTemplateIssues
  replacementSourcesParameters: TReplacementSourceParameters
  replacementSources: TReplacementSource[]
  // read only fill index of primary volume
  primaryVolumeFillIndex: number
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
  replacementSources: [{ ...EMPTY_REPLACEMENT_SOURCE, priority: 1 }],
  primaryVolumeFillIndex: 0,
}
