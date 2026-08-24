import {
  type TTemplateItem,
  type TTemplateItemWithFormIndex,
} from '@/components/prepare-scan-modal/schemas/templateSchema'
import {
  getVisiblePageReplacements,
  hasVisibleScanTask,
} from './templateItemLocking'

export const includesWaitingForRescan = (items: TTemplateItem[]) =>
  items.some(
    (item) =>
      (item.mainScan.type === 'REPLACEMENT' &&
        item.mainScan.replacement.isWaitingForRescan) ||
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
    .map(({ item }) => ({
      ...item,
      pageReplacements: getVisiblePageReplacements(item),
    }))
    .filter(hasVisibleScanTask)
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
    (item.mainScan.type === 'REPLACEMENT' &&
      item.mainScan.replacement.isWaitingForRescan) ||
    item.pageReplacements.some(
      (replacement) => replacement.isWaitingForRescan
    )) &&
  (!showOnlyUnlocked || !getMainScanLockedForFilter(item))

const getMainScanLockedForFilter = (item: TTemplateItem) => {
  const mainScanLocks = item.mainScan.visible ? [item.mainScan.locked] : []
  const visibleReplacementLocks = getVisiblePageReplacements(item).map(
    (replacement) => replacement.locked
  )
  const locks = [...mainScanLocks, ...visibleReplacementLocks]

  return locks.length > 0 && locks.every(Boolean)
}
