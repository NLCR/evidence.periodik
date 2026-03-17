import { TReplacementSource } from '../../schemas'

export const removeReplacementSourceAtIndex = (
  replacementSources: TReplacementSource[],
  index: number
): TReplacementSource[] => {
  return replacementSources.filter((_, itemIndex) => itemIndex !== index)
}
