import {
  type TMainReplacement,
  type TReplacement,
  type TReplacementSource,
} from '@/components/prepare-scan-modal/schemas/schemas'

type TFilterReplacementSourcesInput = {
  replacementSources: TReplacementSource[]
  mainReplacement: TMainReplacement | null | undefined
  pageReplacements: TReplacement[] | null | undefined
  activePageReplacementIndex: number | null
}

export const getReplacementSourceCandidatesForField = ({
  replacementSources,
  mainReplacement,
  pageReplacements,
  activePageReplacementIndex,
}: TFilterReplacementSourcesInput): TReplacementSource[] => {
  const activeSourceId =
    activePageReplacementIndex !== null
      ? pageReplacements?.[activePageReplacementIndex]?.volume?.volumeId
      : mainReplacement?.volume.volumeId

  const usedSourceIds = [
    mainReplacement?.volume?.volumeId,
    ...(pageReplacements?.map((replacement) => replacement?.volume?.volumeId) ||
      []),
  ]

  return replacementSources.filter(({ volumeId }) => {
    if (!volumeId) return true
    if (volumeId === activeSourceId) return true

    return !usedSourceIds.includes(volumeId)
  })
}
