import dayjs from 'dayjs'
import { type TFunction } from 'i18next'
import { type TTemplateSpecimen } from '@/components/prepare-scan-modal/schemas/schemas'

export const getNumberLabel = (specimen: TTemplateSpecimen, t: TFunction) => {
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
