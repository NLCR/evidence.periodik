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
  isPrimary: boolean
  volume: TReplacementSource | null
  items: Array<{
    specimen: TTemplateSpecimenRef
    pages: string | null
  }>
}

const PRIMARY_VOLUME_GROUP_KEY = '__primary__'
const UNKNOWN_REPLACEMENT_GROUP_KEY = '__unknown_replacement__'

type TGroupedScanItem = TGroupedScanSection['items'][number]

type TGroupedScanSectionAccumulator = Omit<TGroupedScanSection, 'items'> & {
  items: TGroupedScanItem[]
}

type TSectionDescriptor = {
  key: string
  isPrimary: boolean
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

const PRIMARY_SECTION_DESCRIPTOR = {
  key: PRIMARY_VOLUME_GROUP_KEY,
  isPrimary: true,
  volume: null,
}

const UNKNOWN_REPLACEMENT_SECTION_DESCRIPTOR = {
  key: UNKNOWN_REPLACEMENT_GROUP_KEY,
  isPrimary: false,
  volume: null,
}

const getReplacementSectionDescriptor = (
  replacement: TReplacement
): TSectionDescriptor => ({
  key: getVolumeKey(replacement.volume, UNKNOWN_REPLACEMENT_GROUP_KEY),
  isPrimary: false,
  volume: replacement.volume ?? null,
})

const getTemplateItemSectionDescriptor = (
  item: TTemplateItem
): TSectionDescriptor => {
  if (item.usePrimaryVolume) return PRIMARY_SECTION_DESCRIPTOR
  if (item.replacement) return getReplacementSectionDescriptor(item.replacement)
  return UNKNOWN_REPLACEMENT_SECTION_DESCRIPTOR
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

  return Array.from(sections.values())
}
