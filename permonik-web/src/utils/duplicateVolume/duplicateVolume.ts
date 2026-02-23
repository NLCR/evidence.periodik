import { TEditableVolume } from '../../schema/volume'
import { v4 as uuid } from 'uuid'
import { emptyMutationMark } from '../mutationMark'
import { TEditableSpecimen, TSpecimenDamageTypes } from '../../schema/specimen'
import { FieldsToReset } from './types'

const resetDamageTypes = (
  damageTypes: TSpecimenDamageTypes[],
  fieldsToReset: FieldsToReset[]
) => {
  // always remove "OK" as this is a duplicate -> not verified
  let result = damageTypes.filter((dt) => dt !== 'OK')

  if (fieldsToReset.includes(FieldsToReset.missingPages)) {
    result = result.filter((dt) => dt !== 'ChS')
  }
  if (fieldsToReset.includes(FieldsToReset.damagedPages)) {
    result = result.filter((dt) => dt !== 'PP')
  }
  if (fieldsToReset.includes(FieldsToReset.censored)) {
    result = result.filter((dt) => dt !== 'Cz')
  }
  if (fieldsToReset.includes(FieldsToReset.unreadableBinding)) {
    result = result.filter((dt) => dt !== 'NS')
  }
  if (fieldsToReset.includes(FieldsToReset.wrongDate)) {
    result = result.filter((dt) => dt !== 'ChDatum')
  }
  if (fieldsToReset.includes(FieldsToReset.missingNumber)) {
    result = result.filter((dt) => dt !== 'ChCC')
  }
  if (fieldsToReset.includes(FieldsToReset.degradation)) {
    result = result.filter((dt) => dt !== 'Deg')
  }
  if (fieldsToReset.includes(FieldsToReset.wrongPagination)) {
    result = result.filter((dt) => dt !== 'ChPag')
  }
  if (fieldsToReset.includes(FieldsToReset.wrongNumbering)) {
    result = result.filter((dt) => dt !== 'ChCis')
  }
  if (fieldsToReset.includes(FieldsToReset.wrongBinding)) {
    result = result.filter((dt) => dt !== 'ChSv')
  }

  return result
}

export function duplicateVolume(
  volumeData: TEditableVolume,
  specimensData: TEditableSpecimen[],
  fieldsToReset: FieldsToReset[]
): { volume: TEditableVolume; specimens: TEditableSpecimen[] } {
  const duplicatedVolume: TEditableVolume = {
    id: uuid(),
    isLoading: false,
    barCode: fieldsToReset.includes(FieldsToReset.barCode)
      ? ''
      : volumeData.barCode,
    dateFrom: volumeData.dateFrom,
    dateTo: volumeData.dateTo,
    metaTitleId: volumeData.metaTitleId,
    subName: volumeData.subName,
    mutationId: fieldsToReset.includes(FieldsToReset.mutationId)
      ? ''
      : volumeData.mutationId,
    periodicity: volumeData.periodicity,
    firstNumber: volumeData.firstNumber,
    lastNumber: volumeData.lastNumber,
    note: fieldsToReset.includes(FieldsToReset.note) ? '' : volumeData.note,
    showAttachmentsAtTheEnd: volumeData.showAttachmentsAtTheEnd,
    signature: volumeData.signature,
    ownerId: fieldsToReset.includes(FieldsToReset.ownerId)
      ? ''
      : volumeData.ownerId,
    year: volumeData.year,
    mutationMark: fieldsToReset.includes(FieldsToReset.mutationMark)
      ? emptyMutationMark
      : volumeData.mutationMark,
  }
  const duplicatedSpecimens: TEditableSpecimen[] = specimensData.map(
    (specimen: TEditableSpecimen) => ({
      id: uuid(),
      metaTitleId: specimen.metaTitleId,
      volumeId: duplicatedVolume.id,
      barCode: specimen.barCode,
      numExists: specimen.numExists,
      numMissing: specimen.numMissing,
      ownerId: duplicatedVolume.ownerId,
      damageTypes: resetDamageTypes(specimen.damageTypes, fieldsToReset),
      damagedPages: fieldsToReset.includes(FieldsToReset.damagedPages)
        ? []
        : specimen.damagedPages,
      missingPages: fieldsToReset.includes(FieldsToReset.missingPages)
        ? []
        : specimen.missingPages,
      note: fieldsToReset.includes(FieldsToReset.note) ? '' : specimen.note,
      name: specimen.name,
      subName: specimen.subName,
      editionId: specimen.editionId,
      mutationId: specimen.mutationId,
      mutationMark: specimen.mutationMark,
      publicationDate: specimen.publicationDate,
      publicationDateString: specimen.publicationDateString,
      number: specimen.number,
      attachmentNumber: specimen.attachmentNumber,
      pagesCount: specimen.pagesCount,
      isAttachment: specimen.isAttachment,
      duplicated: true,
    })
  )

  return { volume: duplicatedVolume, specimens: duplicatedSpecimens }
}
