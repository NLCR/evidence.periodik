import type {
  TReplacement,
  TTemplateItem,
} from '@/components/prepare-scan-modal/schemas/schemas'

export const isTemplateItemVisibleForExport = (item: TTemplateItem): boolean =>
  item.visible ?? !item.locked

export const isTemplateReplacementVisibleForExport = (
  replacement: TReplacement
): boolean => replacement.visible ?? !replacement.locked

export const applyExportVisibilityToTemplateItems = (
  items: TTemplateItem[]
): TTemplateItem[] =>
  items.flatMap((item) => {
    if (!isTemplateItemVisibleForExport(item)) return []

    const visibleReplacements = item.pageReplacements.filter((replacement) =>
      isTemplateReplacementVisibleForExport(replacement)
    )

    return [{ ...item, pageReplacements: visibleReplacements }]
  })
