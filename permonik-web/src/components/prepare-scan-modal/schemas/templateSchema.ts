import { TemplateState } from './templateStateSchema'
import { TVolume } from '../../../schema/volume'

export type TTemplateReplacement = {
  pages: string
  sourceVolumeId?: string
  isUnreplaceable: boolean
  isWaitingForRescan: boolean
}

export type TTemplateItem = {
  specimenNumber: string
  specimenId?: string
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
