import { TEdition } from '../schema/edition'
import { copyAuditable } from '../schema/common'
import { v4 as uuid } from 'uuid'
import { TEditableVolume, TVolume } from '../schema/volume'

export const repairVolume = (
  volume: TEditableVolume,
  editions: TEdition[]
): TVolume => {
  return {
    ...copyAuditable(volume),
    id: volume.id.length ? volume.id : uuid(),
    barCode: volume.barCode?.trim() || '',
    dateFrom: volume.dateFrom ?? '',
    dateTo: volume.dateTo ?? '',
    metaTitleId: volume.metaTitleId ?? '',
    subName: volume.subName?.trim() ?? '',
    mutationId: volume.mutationId ?? '',
    periodicity:
      volume.periodicity.map((p) => ({
        numExists: p.numExists ?? false,
        isAttachment: p.isAttachment ?? false,
        editionId:
          p.editionId ?? editions.find((pub) => pub.isDefault)?.id ?? '',
        day: p.day,
        pagesCount: Number(p.pagesCount) ?? 0,
        name: p.name?.trim() ?? '',
        subName: p.subName?.trim() ?? '',
      })) ?? [],
    firstNumber: Number(volume.firstNumber) ?? -1,
    lastNumber: Number(volume.lastNumber),
    note: volume.note?.trim() ?? '',
    showAttachmentsAtTheEnd: volume.showAttachmentsAtTheEnd ?? false,
    signature: volume.signature?.trim() ?? '',
    ownerId: volume.ownerId ?? '',
    year: Number(volume.year) ?? -1,
    mutationMark: volume.mutationMark?.trim() ?? '',
    mutationMarkNumber: volume.mutationMarkNumber?.trim() ?? '',
    mutationMarkNumberDescription:
      volume.mutationMarkNumberDescription?.trim() ?? '',
  }
}
