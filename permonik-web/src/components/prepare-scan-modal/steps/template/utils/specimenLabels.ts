import dayjs from 'dayjs'
import { TFunction } from 'i18next'
undefined

export const getNumberLabel = (
  specimen: TTemplateSpecimenRef,
  t: TFunction
) => {
  if (specimen.number)
    return t('prepare_scan_modal.content_template.issue_number_label', {
      number: specimen.number,
    })
  if (specimen.attachmentNumber)
    return t('prepare_scan_modal.content_template.attachment_number_label', {
      number: specimen.attachmentNumber,
    })
  return t('prepare_scan_modal.content_template.unknown_number_label')
}

export const getDateLabel = (date: string) => dayjs(date).format('DD. MM. YYYY')
