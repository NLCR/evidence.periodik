import type {
  TMainReplacement,
  TReplacement,
  TReplacementSource,
  TTemplateItem,
  TTemplateSpecimen,
} from '@/components/prepare-scan-modal/schemas/schemas'
import { ResolutionStatus } from '@/components/prepare-scan-modal/schemas/schemas'
import { getFilteredTemplateItems } from './utils/filters'
import {
  getMainReplacement,
  getVisiblePageReplacements,
} from './utils/templateItemLocking'

export type TGroupedScanSection = {
  key: string
  sectionType:
    | 'primaryVolume'
    | 'volume'
    | 'waitingForRescan'
    | 'unreplaceable'
    | 'notFilled'
  volume: TReplacementSource | null
  items: Array<{
    specimen: TTemplateSpecimen
    pages: number[] | null
  }>
}

const PRIMARY_VOLUME_GROUP_KEY = '__primary__'
const UNKNOWN_REPLACEMENT_GROUP_KEY = '__unknown_replacement__'
const WAITING_FOR_RESCAN_GROUP_KEY = '__waiting_for_rescan__'
const UNREPLACEABLE_GROUP_KEY = '__unreplaceable__'
const NOT_FILLED_GROUP_KEY = '__not_filled__'

const STATUS_SECTION_KEYS = [
  WAITING_FOR_RESCAN_GROUP_KEY,
  UNREPLACEABLE_GROUP_KEY,
  NOT_FILLED_GROUP_KEY,
]

type TGroupedScanItem = TGroupedScanSection['items'][number]

type TGroupedScanSectionAccumulator = Omit<TGroupedScanSection, 'items'> & {
  items: TGroupedScanItem[]
}

type TSectionDescriptor = {
  key: string
  sectionType: TGroupedScanSection['sectionType']
  volume: TReplacementSource | null
}

const hasVolumeIdentity = (volume: TReplacementSource): boolean =>
  Boolean(
    volume.signature ||
    volume.owner ||
    volume.barcode ||
    volume.mutation ||
    volume.mutationEdition
  )

const getVolumeKey = (
  volume: TReplacementSource | null | undefined,
  fallbackKey: string
) => {
  if (!volume) return fallbackKey
  if (volume.volumeId) return volume.volumeId
  if (!hasVolumeIdentity(volume)) return fallbackKey

  return [
    volume.signature ?? '',
    volume.owner ?? '',
    volume.barcode ?? '',
    volume.mutation ?? '',
    volume.mutationEdition ?? '',
  ].join('|')
}

const appendItemToSection = (
  sections: Map<string, TGroupedScanSectionAccumulator>,
  descriptor: TSectionDescriptor,
  item: TGroupedScanItem
) => {
  const section = sections.get(descriptor.key) ?? { ...descriptor, items: [] }

  section.items.push(item)
  sections.set(descriptor.key, section)
}

const PRIMARY_SECTION_DESCRIPTOR: TSectionDescriptor = {
  key: PRIMARY_VOLUME_GROUP_KEY,
  sectionType: 'primaryVolume',
  volume: null,
}

const WAITING_FOR_RESCAN_SECTION_DESCRIPTOR: TSectionDescriptor = {
  key: WAITING_FOR_RESCAN_GROUP_KEY,
  sectionType: 'waitingForRescan',
  volume: null,
}

const UNREPLACEABLE_SECTION_DESCRIPTOR: TSectionDescriptor = {
  key: UNREPLACEABLE_GROUP_KEY,
  sectionType: 'unreplaceable',
  volume: null,
}

const NOT_FILLED_SECTION_DESCRIPTOR: TSectionDescriptor = {
  key: NOT_FILLED_GROUP_KEY,
  sectionType: 'notFilled',
  volume: null,
}

const hasReplacementSource = (replacement: TMainReplacement): boolean =>
  getVolumeKey(replacement.volume, UNKNOWN_REPLACEMENT_GROUP_KEY) !==
  UNKNOWN_REPLACEMENT_GROUP_KEY

const getReplacementSectionDescriptor = (
  replacement: TMainReplacement | TReplacement
): TSectionDescriptor => ({
  key: getVolumeKey(replacement.volume, UNKNOWN_REPLACEMENT_GROUP_KEY),
  sectionType: 'volume',
  volume: replacement.volume ?? null,
})

const getTemplateItemSectionDescriptor = (
  item: TTemplateItem
): TSectionDescriptor => {
  const mainReplacement = getMainReplacement(item)

  if (item.mainScan.type === 'PRIMARY') return PRIMARY_SECTION_DESCRIPTOR
  if (mainReplacement?.status === ResolutionStatus.WAITING_FOR_RESCAN)
    return WAITING_FOR_RESCAN_SECTION_DESCRIPTOR
  if (mainReplacement?.status === ResolutionStatus.UNREPLACEABLE)
    return UNREPLACEABLE_SECTION_DESCRIPTOR
  if (!mainReplacement || !hasReplacementSource(mainReplacement))
    return NOT_FILLED_SECTION_DESCRIPTOR

  return getReplacementSectionDescriptor(mainReplacement)
}

const initSectionsAccumulator = (): Map<
  string,
  TGroupedScanSectionAccumulator
> => new Map()

export const buildGroupedScanSections = (
  items: TTemplateItem[],
  showOnlyRescans: boolean,
  showOnlyUnlocked: boolean
): TGroupedScanSection[] => {
  const visibleItems = getFilteredTemplateItems(
    items,
    showOnlyRescans,
    showOnlyUnlocked
  )
  const sections = initSectionsAccumulator()

  for (const { item } of visibleItems) {
    if (item.mainScan.visible) {
      const mainReplacement = getMainReplacement(item)

      appendItemToSection(sections, getTemplateItemSectionDescriptor(item), {
        specimen: item.specimen,
        pages:
          item.mainScan.type === 'PRIMARY'
            ? null
            : mainReplacement?.pages || null,
      })
    }

    for (const replacement of getVisiblePageReplacements(item)) {
      appendItemToSection(
        sections,
        getReplacementSectionDescriptor(replacement),
        {
          specimen: item.specimen,
          pages: replacement.pages || null,
        }
      )
    }
  }

  const allSections = Array.from(sections.values()).filter(
    (section) => section.items.length > 0
  )

  // status sections at the end
  return [
    ...allSections.filter(
      (section) => !STATUS_SECTION_KEYS.includes(section.key)
    ),
    ...allSections.filter((section) =>
      STATUS_SECTION_KEYS.includes(section.key)
    ),
  ]
}
