import {
  buildReplacementOptionLabel,
  normalizeReplacement,
  TReplacementSelectOption,
} from '../../utils/replacementInput'
import { TReplacement, TReplacementSource } from '../../schemas'
import { TReplacementSourceCandidate } from '../../../../api/replacementSourceCandidates'

export const createSelectOptionsFromReplacements = (
  replacements: (TReplacement | TReplacementSource)[]
): TReplacementSelectOption[] =>
  replacements.map((replacement, index) => ({
    id: `replacement-source-${index}`,
    label: buildReplacementOptionLabel(normalizeReplacement(replacement)),
    replacement: normalizeReplacement(replacement),
  }))

export const mapReplacementSourceCandidateToSelectOption = (
  candidate: TReplacementSourceCandidate
): TReplacementSelectOption => ({
  id: candidate.id,
  label: buildReplacementOptionLabel(candidate),
  replacement: normalizeReplacement(candidate),
})

const normalizeIdentityPart = (value: string) => value.trim().toLowerCase()

export const createReplacementSourceIdentity = (
  replacement: TReplacementSource | TReplacementSourceCandidate
) =>
  [replacement.signature, replacement.owner, replacement.barcode]
    .map(normalizeIdentityPart)
    .join('::')

type TFilterReplacementSourceCandidatesArgs = {
  candidates: TReplacementSourceCandidate[]
  replacementSources: TReplacementSource[]
  currentReplacementSource: TReplacementSource
}

export const filterReplacementSourceCandidates = ({
  candidates,
  replacementSources,
  currentReplacementSource,
}: TFilterReplacementSourceCandidatesArgs): TReplacementSourceCandidate[] => {
  const currentIdentity = createReplacementSourceIdentity(
    currentReplacementSource
  )
  const selectedIdentities = new Set(
    replacementSources
      .map(createReplacementSourceIdentity)
      .filter((identity) => identity !== currentIdentity)
  )

  return candidates.filter((candidate) => {
    const candidateIdentity = createReplacementSourceIdentity(candidate)
    return !selectedIdentities.has(candidateIdentity)
  })
}

export const createSelectOptionsFromReplacementSourceCandidates = (
  candidates: TReplacementSourceCandidate[]
): TReplacementSelectOption[] =>
  candidates.map(mapReplacementSourceCandidateToSelectOption)

export const removeReplacementSourceAtIndex = (
  replacementSources: TReplacementSource[],
  index: number
): TReplacementSource[] => {
  const next = replacementSources.filter((_, itemIndex) => itemIndex !== index)

  return next.length > 0 ? next : [normalizeReplacement(null)]
}
