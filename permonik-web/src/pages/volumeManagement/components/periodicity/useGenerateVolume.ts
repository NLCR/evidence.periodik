import { cloneDeep } from 'lodash'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { repairVolume } from '../../../../utils/volume'
import { TEditableVolume, VolumeSchema } from '../../../../schema/volume'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { toast } from 'react-toastify'
import { TEditableSpecimen } from '../../../../schema/specimen'
import { repairOrCreateSpecimen } from '../../../../utils/specimen'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TEdition } from '../../../../schema/edition'

const getDaysArray = (start: string, end: string): string[] => {
  const arr: string[] = []
  let current = dayjs(start)
  const endDay = dayjs(end)

  while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
    arr.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  return arr
}

const getDayName = (date: string): string => {
  return dayjs(date).format('dddd')
}

export const useGenerateVolume = (
  editions: TEdition[],
  setPeriodicityModalVisible: (value: boolean) => void
) => {
  const { reset, getValues } = useFormContext()
  const { i18n } = useTranslation()

  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const setVolumeState = useVolumeManagementStore(
    (state) => state.volumeActions.setVolumeState
  )
  const setHasUnsavedData = useVolumeManagementStore(
    (state) => state.setStateHasUnsavedData
  )
  return () => {
    // This ensures that `getDayName` will return english name of day
    dayjs.locale('en')
    const volumeData = getValues() as TEditableVolume
    const volumeClone = cloneDeep(volumeData)
    const repairedVolume = repairVolume(volumeClone, editions)
    const validation = VolumeSchema.safeParse(repairedVolume)

    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      // toast.error(t('volume_overview.volume_input_data_validation_error'))
      return false
    }

    const dates = getDaysArray(repairedVolume.dateFrom, repairedVolume.dateTo)

    const specimens: TEditableSpecimen[] = []

    let number = repairedVolume.firstNumber
    let attachmentNumber = 1
    let periodicAttachmentNumber = 1
    const defaultEdition = editions.find((edition) => edition.isDefault)

    dates.forEach((dt) => {
      const dayStr = getDayName(dt)
      let inserted = false
      repairedVolume.periodicity.forEach((p) => {
        if (p.numExists && p.day === dayStr) {
          const isAttachment = !!editions.find((pub) => pub.id === p.editionId)
            ?.isAttachment
          const isPeriodicAttachment = !!editions.find(
            (pub) => pub.id === p.editionId
          )?.isPeriodicAttachment

          const specimen = repairOrCreateSpecimen(
            {
              publicationDate: dt,
              publicationDateString: dayjs(dt).format('YYYYMMDD'),
              mutationMark: repairedVolume.mutationMark,
              mutationId: repairedVolume.mutationId,
              numExists: true,
              pagesCount: p.pagesCount,
              name: p.name,
              subName: p.subName,
              editionId: p.editionId,
              isAttachment,
              number: !isAttachment ? number.toString() : '',
              attachmentNumber: isAttachment
                ? isPeriodicAttachment
                  ? periodicAttachmentNumber.toString()
                  : attachmentNumber.toString()
                : '',
            },
            repairedVolume
          )

          if (isPeriodicAttachment) {
            periodicAttachmentNumber += 1
          } else if (isAttachment) {
            attachmentNumber += 1
          } else {
            number += 1
          }

          inserted = true

          specimens.push(specimen)
        }
      })

      if (!inserted) {
        const specimen = repairOrCreateSpecimen(
          {
            publicationDate: dt,
            publicationDateString: dayjs(dt).format('YYYYMMDD'),
            mutationMark: repairedVolume.mutationMark,
            mutationId: repairedVolume.mutationId,
            numExists: false,
            editionId: defaultEdition?.id,
          },
          repairedVolume
        )

        specimens.push(specimen)
      }
    })

    dayjs.locale(i18n.resolvedLanguage)
    specimensActions.setSpecimensState(specimens, true)
    volumePeriodicityActions.setPeriodicityGenerationUsed(true)
    toast.success(t('volume_overview.specimens_generated_successfully'))
    setVolumeState(volumeClone, false)
    setHasUnsavedData(true)
    reset(volumeClone) // reset isDirty flag
    setPeriodicityModalVisible(false)
    return true
  }
}
