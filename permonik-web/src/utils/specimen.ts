import type { TVolume } from '../schema/volume'
import { v4 as uuid } from 'uuid'
import { TEdition } from '../schema/edition'
import { copyAuditable } from '../schema/common'
import { TEditableSpecimen, TSpecimen } from '../schema/specimen'

export const filterSpecimen = (
  specimen: TEditableSpecimen
): TEditableSpecimen => {
  return {
    ...copyAuditable(specimen),
    id: specimen.id,
    metaTitleId: specimen.metaTitleId,
    volumeId: specimen.volumeId,
    barCode: specimen.barCode.trim(),
    numExists: specimen.numExists,
    numMissing: specimen.numMissing,
    ownerId: specimen.ownerId,
    damageTypes: specimen.damageTypes,
    damagedPages: specimen.damagedPages,
    missingPages: specimen.missingPages,
    note: specimen.note.trim(),
    name: specimen.name.trim(),
    subName: specimen.subName.trim(),
    editionId: specimen.editionId,
    mutationId: specimen.mutationId,
    mutationMark: specimen.mutationMark.trim(),
    publicationDate: specimen.publicationDate,
    publicationDateString: specimen.publicationDateString,
    number: specimen.number.trim(),
    attachmentNumber: specimen.attachmentNumber.trim(),
    pagesCount: Number(
      specimen.pagesCount.toString().replace(/\D/g, '').trim()
    ),
    isAttachment: specimen.isAttachment,
    duplicated: specimen.duplicated,
  }
}
export const repairOrCreateSpecimen = (
  specimen: Partial<TEditableSpecimen>,
  volume: TVolume
): TSpecimen => {
  return {
    ...copyAuditable(specimen),
    id: specimen.id ?? uuid(),
    metaTitleId: volume.metaTitleId,
    volumeId: volume.id,
    barCode: volume.barCode.trim(),
    numExists: specimen.numExists ?? false,
    numMissing: specimen.numMissing ?? false,
    ownerId: volume.ownerId,
    damageTypes: specimen.damageTypes ?? [],
    damagedPages: specimen.damagedPages ?? [],
    missingPages: specimen.missingPages ?? [],
    note: specimen.note?.trim() ?? '',
    name: specimen.name?.trim() ?? '',
    subName: specimen.subName?.trim() ?? '',
    editionId: specimen.editionId ?? '',
    mutationId: specimen.mutationId ?? '',
    mutationMark: specimen.mutationMark?.trim() ?? '',
    publicationDate: specimen.publicationDate ?? '',
    publicationDateString: specimen.publicationDateString ?? '',
    number: specimen.number?.trim() ?? '',
    attachmentNumber: specimen.attachmentNumber?.trim() ?? '',
    pagesCount: specimen.pagesCount ?? 0,
    isAttachment: specimen.isAttachment ?? false,
  }
}
export const duplicatePartialSpecimen = (
  specimen: Partial<TEditableSpecimen>
): TEditableSpecimen => {
  return {
    id: uuid(),
    metaTitleId: specimen.metaTitleId ?? '',
    volumeId: specimen.volumeId ?? '',
    barCode: specimen.barCode ?? '',
    numExists: specimen.numExists ?? false,
    numMissing: specimen.numMissing ?? false,
    ownerId: specimen.ownerId ?? '',
    damageTypes: specimen.damageTypes ?? [],
    damagedPages: specimen.damagedPages ?? [],
    missingPages: specimen.missingPages ?? [],
    note: specimen.note ?? '',
    name: specimen.name ?? '',
    subName: specimen.subName ?? '',
    editionId: specimen.editionId ?? '',
    mutationId: specimen.mutationId ?? '',
    mutationMark: specimen.mutationMark ?? '',
    publicationDate: specimen.publicationDate ?? '',
    publicationDateString: specimen.publicationDateString ?? '',
    number: specimen.number ?? '',
    attachmentNumber: specimen.attachmentNumber ?? '',
    pagesCount: specimen.pagesCount ?? 0,
    isAttachment: specimen.isAttachment ?? false,
    duplicated: true,
  }
}
export const copySpecimen = (
  specimen: TSpecimen,
  volume: TVolume
): TEditableSpecimen => {
  return {
    id: uuid(),
    metaTitleId: specimen.metaTitleId,
    volumeId: volume.id,
    barCode: '',
    numExists: specimen.numExists,
    numMissing: specimen.numMissing,
    ownerId: volume.ownerId,
    damageTypes: [],
    damagedPages: [],
    missingPages: [],
    note: '',
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
  }
}
export const checkAttachmentChange = (
  editions: TEdition[],
  specimen: TEditableSpecimen
): TEditableSpecimen => {
  const edition = editions.find((p) => p.id === specimen.editionId)
  const isAttachment =
    edition?.isAttachment || edition?.isPeriodicAttachment || false

  return {
    ...specimen,
    isAttachment: isAttachment,
  }
}
