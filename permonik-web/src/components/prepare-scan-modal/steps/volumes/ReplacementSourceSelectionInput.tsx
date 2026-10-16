import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useReplacementSourceCandidatesQuery } from '@/api/replacementSourceCandidates'
import type { TScanTemplateSettings } from '@/components/prepare-scan-modal/schemas/schemas'
import Loader from '@/components/Loader'
import ShowError from '@/components/ShowError'
import ReplacementSourceInput from '../common/ReplacementSourceInput'

type Props = {
  volumeId: string
  index: number
}

const ReplacementSourceSelectionInput = ({ volumeId, index }: Props) => {
  const { control } = useFormContext<TScanTemplateSettings>()
  const issues = useWatch({ control, name: 'issues' })
  const replacementSourcesParameters = useWatch({
    control,
    name: 'replacementSourcesParameters',
  })
  const replacementSources = useWatch({ control, name: 'replacementSources' })
  const {
    data: candidates,
    isPending,
    isError,
  } = useReplacementSourceCandidatesQuery(volumeId, {
    issues,
    replacementSourcesParameters,
    replacementSources: replacementSources.slice(0, index),
  })

  if (isPending) return <Loader size="small" />
  if (isError && !candidates) return <ShowError />

  return (
    <Controller
      control={control}
      name={`replacementSources.${index}`}
      render={({ field }) => (
        <ReplacementSourceInput
          value={field.value}
          candidates={candidates?.filter(
            (candidate) =>
              !replacementSources.some(
                (source, sourceIndex) =>
                  sourceIndex !== index &&
                  source.volumeId === candidate.volumeId
              )
          )}
          onChange={field.onChange}
        />
      )}
    />
  )
}

export default ReplacementSourceSelectionInput
