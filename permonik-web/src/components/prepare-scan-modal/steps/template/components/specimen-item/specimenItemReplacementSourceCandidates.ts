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
      ? pageReplacements?.[activePageReplacementIndex]?.volume?.id
      : mainReplacement?.volume.id

  const usedSourceIds = [
    mainReplacement?.volume?.id,
    ...(pageReplacements?.map((replacement) => replacement?.volume?.id) || []),
  ]

  return replacementSources.filter(({ id }) => {
    if (!id) return true
    if (id === activeSourceId) return true

    return !usedSourceIds.includes(id)
  })
}
