import { TSpecimenOverview } from '../../../../schema/specimen'

export type TMainModalData = {
  data: TSpecimenOverview[]
  day: string
} | null

export type TLibrarySpecimenIds = { records: { dedupIds: string[] }[] }
