import {
  TTemplateItem,
  TTemplateItemWithFormIndex,
} from '@/components/prepare-scan-modal/schemas/templateSchema'

export const includesWaitingForRescan = (items: TTemplateItem[]) =>
  items.some(
    (item) =>
      item.replacement?.isWaitingForRescan ||
      item.pageReplacements.some(
        (replacement) => replacement.isWaitingForRescan
      )
  )

export const filterTemplateItemsForPrint = (
  items: TTemplateItem[],
  showOnlyRescans: boolean,
  showOnlyUnlocked: boolean
) => {
  const filteredItems = getFilteredTemplateItems(
    items,
    showOnlyRescans,
    showOnlyUnlocked
  )

  return filteredItems
    .filter((item) => item.item.visible)
    .map((item) => ({
      ...item.item,
      pageReplacements: item.item.pageReplacements.filter((r) => r.visible),
    }))
}

export const getFilteredTemplateItems = (
  items: TTemplateItem[],
  showOnlyRescans: boolean,
  showOnlyUnlocked: boolean
): TTemplateItemWithFormIndex[] =>
  items
    .map((item, formIndex) => ({ item, formIndex }))
    .filter(({ item }) =>
      shouldIncludeTemplateItem(item, showOnlyRescans, showOnlyUnlocked)
    )

export const shouldIncludeTemplateItem = (
  item: TTemplateItem,
  showOnlyRescans: boolean,
  showOnlyUnlocked: boolean
) =>
  (!showOnlyRescans ||
    !!item.replacement?.isWaitingForRescan ||
    item.pageReplacements.some(
      (replacement) => replacement.isWaitingForRescan
    )) &&
  (!showOnlyUnlocked || !item.locked)
