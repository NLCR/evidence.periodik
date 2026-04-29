import {
  TemplateState,
  TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'

export const hasWaitingReplacement = (item: TTemplate['items'][number]) =>
  item.replacement?.isWaitingForRescan ||
  item.pageReplacements.some((replacement) => replacement.isWaitingForRescan)

export const applyItemLock = (
  item: TTemplate['items'][number],
  locked: boolean
): TTemplate['items'][number] => ({
  ...item,
  locked,
  visible: !locked,
  replacement: item.replacement
    ? {
        ...item.replacement,
        locked,
        visible: !locked,
      }
    : item.replacement,
  pageReplacements: item.pageReplacements.map((replacement) => ({
    ...replacement,
    locked,
    visible: !locked,
  })),
})

export const applyItemVisibility = (
  item: TTemplate['items'][number],
  visible: boolean
): TTemplate['items'][number] => ({
  ...item,
  visible,
  replacement: item.replacement
    ? {
        ...item.replacement,
        visible,
      }
    : item.replacement,
  pageReplacements: item.pageReplacements.map((replacement) => ({
    ...replacement,
    visible,
  })),
})

export const initItemVisibility = (
  item: TTemplate['items'][number]
): TTemplate['items'][number] => ({
  ...item,
  visible: !item.locked,
  replacement: item.replacement
    ? {
        ...item.replacement,
        visible: !item.locked,
      }
    : item.replacement,
  pageReplacements: item.pageReplacements.map((replacement) => ({
    ...replacement,
    visible: !replacement.locked,
  })),
})

export const isLockingEnabled = (templateState: TemplateState): boolean =>
  templateState === TemplateState.CREATED ||
  templateState === TemplateState.WAITING_FOR_RESCAN ||
  templateState === TemplateState.LATE_FIXES
