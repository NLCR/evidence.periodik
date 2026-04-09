import { TFunction } from 'i18next'
import { TGroupedScanSection } from '../templateGrouping'

export type SectionMetadataItem = {
  label: string
  value: string
}

export const getSectionTitle = (section: TGroupedScanSection, t: TFunction) =>
  section.isPrimary
    ? t('prepare_scan_modal.content_template.primary_volume_section')
    : section.volume?.signature
      ? `${t('prepare_scan_modal.content_template.signature_label')}: ${section.volume.signature}`
      : t('prepare_scan_modal.content_template.unknown_signature')

export const getSectionMetadata = (
  section: TGroupedScanSection,
  t: TFunction
): SectionMetadataItem[] =>
  [
    {
      label: t('prepare_scan_modal.content_template.volume_owner'),
      value: section.volume?.owner,
    },
    {
      label: t('prepare_scan_modal.content_template.volume_barcode_short'),
      value: section.volume?.barcode,
    },
    {
      label: t('prepare_scan_modal.content_template.volume_mutation'),
      value: section.volume?.mutation,
    },
    {
      label: t('prepare_scan_modal.content_template.volume_mutation_edition'),
      value: section.volume?.mutationEdition,
    },
  ].filter((item): item is SectionMetadataItem => !!item.value)
