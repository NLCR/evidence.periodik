import { describe, expect, it } from 'vitest'
import { applyExportVisibilityToTemplateItems } from './templateExportVisibility'

describe('applyExportVisibilityToTemplateItems', () => {
  it('respektuje item.visible a replacement.visible s fallbackem na !locked', () => {
    const items = [
      {
        specimen: { id: 'a', numExists: true, numMissing: false },
        locked: false,
        visible: false,
        usePrimaryVolume: true,
        replacement: null,
        pageReplacements: [
          {
            volume: {},
            pages: '1',
            isUnreplaceable: false,
            isWaitingForRescan: false,
            locked: true,
            visible: true,
          },
        ],
      },
      {
        specimen: { id: 'b', numExists: true, numMissing: false },
        locked: true,
        usePrimaryVolume: true,
        replacement: null,
        pageReplacements: [
          {
            volume: {},
            pages: '2',
            isUnreplaceable: false,
            isWaitingForRescan: false,
            locked: true,
            visible: true,
          },
          {
            volume: {},
            pages: '3',
            isUnreplaceable: false,
            isWaitingForRescan: false,
            locked: false,
            visible: false,
          },
        ],
      },
    ] as any

    const result = applyExportVisibilityToTemplateItems(items)

    expect(result).toHaveLength(1)
    expect(result[0].specimen.id).toBe('b')
    expect(result[0].pageReplacements).toHaveLength(1)
    expect(result[0].pageReplacements[0].pages).toBe('2')
  })
})
