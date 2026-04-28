import { describe, expect, it } from 'vitest'
import { sanitizeTemplateForApi } from './mutations'

describe('sanitizeTemplateForApi', () => {
  it('odstrani visible z item i page replacements a zachova locked', () => {
    const template = {
      state: 'OPEN',
      primaryVolume: {},
      items: [
        {
          specimen: { id: 'x', numExists: true, numMissing: false },
          locked: true,
          visible: false,
          usePrimaryVolume: false,
          replacement: null,
          pageReplacements: [
            {
              volume: {},
              pages: '7',
              isUnreplaceable: false,
              isWaitingForRescan: false,
              locked: false,
              visible: true,
            },
          ],
        },
      ],
    } as any

    const result = sanitizeTemplateForApi(template)

    expect(result.items[0].locked).toBe(true)
    expect(result.items[0]).not.toHaveProperty('visible')
    expect(result.items[0].pageReplacements[0].locked).toBe(false)
    expect(result.items[0].pageReplacements[0]).not.toHaveProperty('visible')
  })
})
