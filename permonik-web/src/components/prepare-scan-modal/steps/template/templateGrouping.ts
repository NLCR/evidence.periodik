import {
  TReplacement,
  TReplacementSource,
  TTemplateItem,
  TTemplateSpecimenRef,
} from '../../schemas/schemas'

export type TVisibleTemplateItem = {
  item: TTemplateItem
  formIndex: number
}

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
    specimen: TTemplateSpecimenRef
    pages: string | null
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

export const shouldIncludeTemplateItem = (
  item: TTemplateItem,
  showOnlyRescans: boolean
) =>
  showOnlyRescans
    ? !!item.replacement?.isWaitingForRescan ||
      item.pageReplacements.some(
        (replacement) => replacement.isWaitingForRescan
      )
    : true

export const getVisibleTemplateItems = (
  items: TTemplateItem[],
  showOnlyRescans: boolean
): TVisibleTemplateItem[] =>
  items
    .map((item, formIndex) => ({ item, formIndex }))
    .filter(({ item }) => shouldIncludeTemplateItem(item, showOnlyRescans))

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
  if (volume.id) return volume.id
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

const hasReplacementSource = (replacement: TReplacement): boolean =>
  getVolumeKey(replacement.volume, UNKNOWN_REPLACEMENT_GROUP_KEY) !==
  UNKNOWN_REPLACEMENT_GROUP_KEY

const getReplacementSectionDescriptor = (
  replacement: TReplacement
): TSectionDescriptor => ({
  key: getVolumeKey(replacement.volume, UNKNOWN_REPLACEMENT_GROUP_KEY),
  sectionType: 'volume',
  volume: replacement.volume ?? null,
})

const getTemplateItemSectionDescriptor = (
  item: TTemplateItem
): TSectionDescriptor => {
  if (item.usePrimaryVolume) return PRIMARY_SECTION_DESCRIPTOR
  if (item.replacement?.isWaitingForRescan)
    return WAITING_FOR_RESCAN_SECTION_DESCRIPTOR
  if (item.replacement?.isUnreplaceable) return UNREPLACEABLE_SECTION_DESCRIPTOR
  if (!item.replacement || !hasReplacementSource(item.replacement))
    return NOT_FILLED_SECTION_DESCRIPTOR

  return getReplacementSectionDescriptor(item.replacement)
}

const initSectionsAccumulator = (): Map<
  string,
  TGroupedScanSectionAccumulator
> =>
  new Map([
    [PRIMARY_VOLUME_GROUP_KEY, { ...PRIMARY_SECTION_DESCRIPTOR, items: [] }],
  ])

export const buildGroupedScanSections = (
  items: TTemplateItem[],
  showOnlyRescans: boolean
): TGroupedScanSection[] => {
  const visibleItems = getVisibleTemplateItems(items, showOnlyRescans)
  const sections = initSectionsAccumulator()

  for (const { item } of visibleItems) {
    appendItemToSection(sections, getTemplateItemSectionDescriptor(item), {
      specimen: item.specimen,
      pages: item.usePrimaryVolume ? null : item.replacement?.pages || null,
    })

    for (const replacement of item.pageReplacements) {
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

  const allSections = Array.from(sections.values())

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
