import {
  TemplateState,
  TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'

export const hasWaitingReplacement = (item: TTemplate['items'][number]) =>
  item.replacement?.isWaitingForRescan ||
  item.pageReplacements.some((replacement) => replacement.isWaitingForRescan)

export const applyItemLockState = (
  item: TTemplate['items'][number],
  locked: boolean
): TTemplate['items'][number] => ({
  ...item,
  locked,
  replacement: item.replacement
    ? {
        ...item.replacement,
        locked,
      }
    : item.replacement,
  pageReplacements: item.pageReplacements.map((replacement) => ({
    ...replacement,
    locked,
  })),
})

export const isLockingEnabled = (templateState: TemplateState): boolean =>
  templateState === TemplateState.CREATED ||
  templateState === TemplateState.WAITING_FOR_RESCAN ||
  templateState === TemplateState.LATE_FIXES
