import dayjs from 'dayjs'
import { type TEditableVolume } from '../schema/volume'
import { type TEditableSpecimen } from '../schema/specimen'
import { duplicatePartialSpecimen } from './specimen'

const toCalendarDate = (value: string) => value.slice(0, 10)

export const isVolumeDateRangeValid = (
  dateFrom: string,
  dateTo: string,
  specimens: TEditableSpecimen[]
) => {
  if (!dateFrom || !dateTo) return false

  const from = toCalendarDate(dateFrom)
  const to = toCalendarDate(dateTo)

  return (
    from <= to &&
    specimens
      .filter((specimen) => specimen.numExists && !specimen.deleted)
      .every((specimen) => {
        const publicationDate = toCalendarDate(specimen.publicationDate)
        return publicationDate >= from && publicationDate <= to
      })
  )
}

export const synchronizeVolumeDateRange = ({
  dateFrom,
  dateTo,
  specimens,
  volume,
  defaultEditionId,
}: {
  dateFrom: string
  dateTo: string
  specimens: TEditableSpecimen[]
  volume: TEditableVolume
  defaultEditionId?: string
}): TEditableSpecimen[] => {
  if (!specimens.some((specimen) => !specimen.deleted) || !defaultEditionId) {
    return specimens
  }

  const from = toCalendarDate(dateFrom)
  const to = toCalendarDate(dateTo)
  const previousFrom = toCalendarDate(volume.dateFrom)
  const previousTo = toCalendarDate(volume.dateTo)
  const specimensInRange = specimens.filter((specimen) => {
    if (specimen.deleted || specimen.numExists) return true

    const publicationDate = toCalendarDate(specimen.publicationDate)
    return publicationDate >= from && publicationDate <= to
  })

  const createEmptySpecimens = (start: string, end: string) => {
    const emptySpecimens: TEditableSpecimen[] = []
    for (
      let date = dayjs(start);
      date.isBefore(end, 'day');
      date = date.add(1, 'day')
    ) {
      emptySpecimens.push(
        duplicatePartialSpecimen({
          volumeId: volume.id,
          publicationDate: date.format('YYYY-MM-DD'),
          mutationId: volume.mutationId,
          mutationMark: volume.mutationMark,
          editionId: defaultEditionId,
        })
      )
    }
    return emptySpecimens
  }

  const specimensBefore =
    from < previousFrom ? createEmptySpecimens(from, previousFrom) : []
  const specimensAfter =
    to > previousTo
      ? createEmptySpecimens(
          dayjs(previousTo).add(1, 'day').format('YYYY-MM-DD'),
          dayjs(to).add(1, 'day').format('YYYY-MM-DD')
        )
      : []

  return [...specimensBefore, ...specimensInRange, ...specimensAfter]
}
