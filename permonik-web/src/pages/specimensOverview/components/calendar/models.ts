import { TSpecimen } from '../../../../schema/specimen'

export type TMainModalData = {
  data: TSpecimen[]
  day: string
} | null

export type TLibrarySpecimenIds = { records: { dedupIds: string[] }[] }
