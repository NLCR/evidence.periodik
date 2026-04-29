import { TTemplateItem } from '@/components/prepare-scan-modal/schemas/templateSchema'

export const includesWaitingForRescan = (items: TTemplateItem[]) =>
  items.some(
    (item) =>
      item.replacement?.isWaitingForRescan ||
      item.pageReplacements.some(
        (replacement) => replacement.isWaitingForRescan
      )
  )
