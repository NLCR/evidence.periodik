import { TemplateState } from './templateStateSchema'
import { TVolume } from '../../../schema/volume'

export type TTemplateVolumeRef = {
  volumeId: string
  signature: string
  barcode: string
  owner: string
  mutation: string
  mutationEdition: string
  title?: string
  subTitle?: string
  dateFrom?: string
  dateTo?: string
}

export type TTemplateReplacement = {
  pages: string
  sourceVolumeId?: string
  isUnreplaceable: boolean
  isWaitingForRescan: boolean
}

export type TTemplateItem = {
  specimenId: string
  usePrimaryVolume: boolean
  sourceVolumeId?: string
  replacements: TTemplateReplacement[]
  note?: string
}

export type TTemplate = {
  state: TemplateState
  primaryVolume: TVolume
  items: TTemplateItem[]
}
