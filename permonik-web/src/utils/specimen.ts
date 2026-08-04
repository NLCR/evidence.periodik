import type { TVolume } from '../schema/volume'
import { v4 as uuid } from 'uuid'
import { type TEdition } from '../schema/edition'
import { copyAuditable } from '../schema/common'
import { type TEditableSpecimen, type TSpecimen } from '../schema/specimen'
import { emptyMutationMark, repairMutationMark } from './mutationMark'

export const isAttachmentSpecimen = (
  specimen: Partial<TEditableSpecimen>,
  editions?: TEdition[]
): boolean => {
  const edition = editions?.find((item) => item.id === specimen.editionId)
  return !!(
    edition?.isAttachment ||
    edition?.isPeriodicAttachment ||
    specimen.isAttachment
  )
}

/**
 * Checks whether an attachment issue can be used on a specific day.
 *
 * Rule: on the target day there must already exist at least one other
 * non-attachment issue. The currently validated row can be excluded via
 * `candidateRowId`.
 */
export const canUseAttachmentOnDate = ({
  editions,
  specimens,
  publicationDate,
  candidateRowId,
}: {
  editions: TEdition[]
  specimens: TEditableSpecimen[]
  publicationDate: string
  candidateRowId?: string
}): boolean => {
  const attachmentEditions = editions.filter(
    (e) => e.isAttachment || e.isPeriodicAttachment
  )

  return specimens.some((specimen) => {
    if (!specimen.numExists) return false
    if (candidateRowId && specimen.id === candidateRowId) return false
    if (specimen.publicationDate !== publicationDate) return false

    return !isAttachmentSpecimen(specimen, attachmentEditions)
  })
}

/**
 * Checks whether deleting the candidate row would violate attachment rule.
 *
 * Rule: it is forbidden to delete the last non-attachment issue for a day
 * when attachments for that same day would remain.
 */
export const canDeleteSpecimen = ({
  editions,
  specimens,
  candidateRow,
}: {
  editions?: TEdition[]
  specimens: TEditableSpecimen[]
  candidateRow: TEditableSpecimen
}): boolean => {
  if (isAttachmentSpecimen(candidateRow, editions) || !candidateRow.numExists) {
    return true
  }

  const publicationDay = candidateRow.publicationDate
  const specimensOnSameDay = specimens.filter((specimen) => {
    if (
      specimen.deleted ||
      specimen.id === candidateRow.id ||
      !specimen.numExists
    ) {
      return false
    }

    return specimen.publicationDate === publicationDay
  })

  const hasRegularIssue = specimensOnSameDay.some(
    (specimen) => !isAttachmentSpecimen(specimen, editions)
  )
  const hasAttachmentIssue = specimensOnSameDay.some((specimen) =>
    isAttachmentSpecimen(specimen, editions)
  )

  return hasRegularIssue || !hasAttachmentIssue
}

export const filterSpecimen = (
  specimen: TEditableSpecimen
): TEditableSpecimen => {
  return {
    ...copyAuditable(specimen),
    id: specimen.id,
    volumeId: specimen.volumeId,
    numExists: specimen.numExists,
    numMissing: specimen.numMissing,
    damageTypes: specimen.damageTypes,
    damagedPages: specimen.damagedPages,
    missingPages: specimen.missingPages,
    note: specimen.note.trim(),
    name: specimen.name.trim(),
    subName: specimen.subName.trim(),
    editionId: specimen.editionId,
    mutationId: specimen.mutationId,
    mutationMark: repairMutationMark(specimen.mutationMark),
    publicationDate: specimen.publicationDate,
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
    volumeId: volume.id,
    numExists: specimen.numExists ?? false,
    numMissing: specimen.numMissing ?? false,
    damageTypes: specimen.damageTypes ?? [],
    damagedPages: specimen.damagedPages ?? [],
    missingPages: specimen.missingPages ?? [],
    note: specimen.note?.trim() ?? '',
    name: specimen.name?.trim() ?? '',
    subName: specimen.subName?.trim() ?? '',
    editionId: specimen.editionId ?? '',
    mutationId: specimen.mutationId ?? '',
    mutationMark: repairMutationMark(specimen.mutationMark),
    publicationDate: specimen.publicationDate ?? '',
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
    volumeId: specimen.volumeId ?? '',
    numExists: specimen.numExists ?? false,
    numMissing: specimen.numMissing ?? false,
    damageTypes: specimen.damageTypes ?? [],
    damagedPages: specimen.damagedPages ?? [],
    missingPages: specimen.missingPages ?? [],
    note: specimen.note ?? '',
    name: specimen.name ?? '',
    subName: specimen.subName ?? '',
    editionId: specimen.editionId ?? '',
    mutationId: specimen.mutationId ?? '',
    mutationMark: specimen.mutationMark ?? emptyMutationMark,
    publicationDate: specimen.publicationDate ?? '',
    number: specimen.number ?? '',
    attachmentNumber: specimen.attachmentNumber ?? '',
    pagesCount: specimen.pagesCount ?? 0,
    isAttachment: specimen.isAttachment ?? false,
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
