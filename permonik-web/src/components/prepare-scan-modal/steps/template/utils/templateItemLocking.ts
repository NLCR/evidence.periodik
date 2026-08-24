import {
  TemplateState,
  type TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'

export const hasWaitingReplacement = (item: TTemplate['items'][number]) =>
  (item.mainScan.type === 'REPLACEMENT' &&
    item.mainScan.replacement.isWaitingForRescan) ||
  item.pageReplacements.some((replacement) => replacement.isWaitingForRescan)

export const getMainReplacement = (item: TTemplate['items'][number]) =>
  item.mainScan.type === 'REPLACEMENT' ? item.mainScan.replacement : null

export const getVisiblePageReplacements = (item: TTemplate['items'][number]) =>
  item.pageReplacements.filter((replacement) => replacement.visible)

export const hasVisibleScanTask = (item: TTemplate['items'][number]): boolean =>
  item.mainScan.visible || getVisiblePageReplacements(item).length > 0

export const areAllScanTasksLocked = (
  item: TTemplate['items'][number]
): boolean => {
  const mainScanLocks = [item.mainScan.locked]
  const pageReplacementLocks = item.pageReplacements.map(
    (replacement) => replacement.locked
  )
  const scanTaskLocks = [...mainScanLocks, ...pageReplacementLocks]

  return scanTaskLocks.length > 0 && scanTaskLocks.every(Boolean)
}

export const applyItemLock = (
  item: TTemplate['items'][number],
  locked: boolean
): TTemplate['items'][number] => {
  return {
    ...item,
    mainScan: {
      ...item.mainScan,
      locked,
      visible: !locked,
    },
    pageReplacements: item.pageReplacements.map((replacement) => ({
      ...replacement,
      locked,
      visible: !locked,
    })),
  }
}

export const applyItemVisibility = (
  item: TTemplate['items'][number],
  visible: boolean
): TTemplate['items'][number] => {
  return {
    ...item,
    mainScan: {
      ...item.mainScan,
      visible,
    },
    pageReplacements: item.pageReplacements.map((replacement) => ({
      ...replacement,
      visible,
    })),
  }
}

export const initItemVisibility = (
  item: TTemplate['items'][number]
): TTemplate['items'][number] => ({
  ...item,
  mainScan: {
    ...item.mainScan,
    visible: !item.mainScan.locked,
  },
  pageReplacements: item.pageReplacements.map((replacement) => ({
    ...replacement,
    visible: !replacement.locked,
  })),
})

export const isLockingEnabled = (templateState: TemplateState): boolean =>
  templateState === TemplateState.CREATED ||
  templateState === TemplateState.WAITING_FOR_RESCAN ||
  templateState === TemplateState.LATE_FIXES
