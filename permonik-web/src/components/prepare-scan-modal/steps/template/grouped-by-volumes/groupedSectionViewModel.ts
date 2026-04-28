import { TFunction } from 'i18next'
import { TGroupedScanSection } from '../templateGrouping'

export type SectionMetadataItem = {
  label: string
  value: string
}

export const getSectionTitle = (section: TGroupedScanSection, t: TFunction) =>
  section.sectionType === 'primaryVolume'
    ? t('prepare_scan_modal.content_template.primary_volume_section')
    : section.sectionType === 'waitingForRescan'
      ? t('prepare_scan_modal.content_template.waiting_for_rescan_section')
      : section.sectionType === 'unreplaceable'
        ? t('prepare_scan_modal.content_template.unreplaceable_section')
        : section.sectionType === 'notFilled'
          ? t('prepare_scan_modal.content_template.not_filled_section')
          : typeof section.volume?.priority === 'number' &&
              section.volume.priority > 0
            ? t(
                'prepare_scan_modal.content_template.replacement_section_title',
                {
                  index: section.volume.priority,
                }
              )
            : t('prepare_scan_modal.content_template.unknown_signature')

export const getSectionMetadata = (
  section: TGroupedScanSection,
  t: TFunction
): SectionMetadataItem[] =>
  [
    {
      label: t('common.fields.signature'),
      value: section.volume?.signature,
    },
    {
      label: t('common.fields.owner'),
      value: section.volume?.owner,
    },
    {
      label: t('common.fields_short.bar_code'),
      value: section.volume?.barcode,
    },
    {
      label: t('common.fields.mutation'),
      value: section.volume?.mutation,
    },
    {
      label: t('common.fields.mutation_mark'),
      value: section.volume?.mutationEdition,
    },
  ].filter((item): item is SectionMetadataItem => !!item.value)
