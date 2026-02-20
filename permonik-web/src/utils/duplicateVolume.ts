import { TEditableVolume } from '../schema/volume'
import { v4 as uuid } from 'uuid'
import { emptyMutationMark } from './mutationMark'
import { TEditableSpecimen } from '../schema/specimen'

export function duplicateVolume(
  volumeData: TEditableVolume,
  specimensData: TEditableSpecimen[],
  fieldsToReset: string[]
): { volume: TEditableVolume; specimens: TEditableSpecimen[] } {
  const duplicatedVolume: TEditableVolume = {
    id: uuid(),
    isLoading: false,
    barCode: fieldsToReset.includes('barCode') ? '' : volumeData.barCode,
    dateFrom: volumeData.dateFrom,
    dateTo: volumeData.dateTo,
    metaTitleId: volumeData.metaTitleId,
    subName: volumeData.subName,
    mutationId: fieldsToReset.includes('mutationId')
      ? ''
      : volumeData.mutationId,
    periodicity: volumeData.periodicity,
    firstNumber: volumeData.firstNumber,
    lastNumber: volumeData.lastNumber,
    note: fieldsToReset.includes('note') ? '' : volumeData.note,
    showAttachmentsAtTheEnd: volumeData.showAttachmentsAtTheEnd,
    signature: fieldsToReset.includes('signature') ? '' : volumeData.signature,
    ownerId: fieldsToReset.includes('ownerId') ? '' : volumeData.ownerId,
    year: volumeData.year,
    mutationMark: fieldsToReset.includes('mutationMark')
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
      damageTypes: fieldsToReset.includes('damageTypes')
        ? []
        : specimen.damageTypes,
      damagedPages: fieldsToReset.includes('damagedPages')
        ? []
        : specimen.damagedPages,
      missingPages: fieldsToReset.includes('missingPages')
        ? []
        : specimen.missingPages,
      note: fieldsToReset.includes('note') ? '' : specimen.note,
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
