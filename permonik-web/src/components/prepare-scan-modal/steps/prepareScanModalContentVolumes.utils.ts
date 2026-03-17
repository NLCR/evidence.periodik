import { TReplacementSource } from '../schemas'

export const removeReplacementSourceAtIndex = (
  replacementSources: TReplacementSource[],
  index: number
): TReplacementSource[] => {
  const next = replacementSources.filter((_, itemIndex) => itemIndex !== index)

  return next.length > 0 ? next : [replacementSources[0]]
}
