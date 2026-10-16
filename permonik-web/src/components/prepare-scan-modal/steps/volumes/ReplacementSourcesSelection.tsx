import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Loader from '../../../Loader'
import ShowError from '../../../ShowError'
import { useReplacementSourceCandidatesQuery } from '@/api/replacementSourceCandidates'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import {
  createEmptyReplacementSource,
  type TReplacementSource,
  type TScanTemplateSettings,
} from '@/components/prepare-scan-modal/schemas/schemas'
import ReplacementSourceSelectionInput from './ReplacementSourceSelectionInput'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

const ReplacementSourcesSelection = ({ volumeId }: { volumeId: string }) => {
  const { t } = useTranslation()
  const { control } = useFormContext<TScanTemplateSettings>()

  const issues = useWatch({ control, name: 'issues' })
  const replacementSourcesParameters = useWatch({
    control,
    name: 'replacementSourcesParameters',
  })
  const replacementSources = useWatch({ control, name: 'replacementSources' })
  const { fields, append, replace } = useFieldArray({
    control,
    name: 'replacementSources',
    keyName: 'fieldId',
  })

  const {
    data: validReplacementSourceCandidates,
    isPending: validReplacementSourceCandidatesPending,
    isError: validReplacementSourceCandidatesError,
  } = useReplacementSourceCandidatesQuery(volumeId, {
    issues,
    replacementSourcesParameters,
    replacementSources: [],
  })

  const buildReplacementSource = (priority: number): TReplacementSource => ({
    ...createEmptyReplacementSource(),
    priority,
  })

  const handleAppend = () => append(buildReplacementSource(fields.length + 1))

  const handleRemove = (index: number) => {
    const nextSources = replacementSources
      .filter((_, sourceIndex) => sourceIndex !== index)
      .map((source, sourceIndex) => ({
        ...source,
        priority: sourceIndex + 1,
      }))

    replace(nextSources)
  }

  useEffect(() => {
    if (
      validReplacementSourceCandidates == null ||
      validReplacementSourceCandidatesError
    ) {
      return
    }

    const validVolumeIds = new Set(
      validReplacementSourceCandidates
        .map((candidate) => candidate.volumeId)
        .filter((volumeId): volumeId is string => !!volumeId)
    )
    const nextSources = replacementSources.map((source) =>
      source.volumeId && !validVolumeIds.has(source.volumeId)
        ? {
            ...createEmptyReplacementSource(),
            priority: source.priority,
          }
        : source
    )

    if (
      nextSources.some((source, index) => source !== replacementSources[index])
    ) {
      replace(nextSources)
    }
  }, [
    replace,
    replacementSources,
    validReplacementSourceCandidates,
    validReplacementSourceCandidatesError,
  ])

  if (
    validReplacementSourceCandidatesPending &&
    !validReplacementSourceCandidates
  ) {
    return <Loader size="small" />
  }
  if (
    validReplacementSourceCandidatesError &&
    !validReplacementSourceCandidates
  ) {
    return <ShowError />
  }

  return (
    <>
      {fields.map((field, index) => (
        <Box key={field.fieldId} display={'flex'} gap={1} alignItems={'center'}>
          <Box flexGrow={0}>{index + 1}: </Box>
          <Box flexGrow={1}>
            <ReplacementSourceSelectionInput
              volumeId={volumeId}
              index={index}
            />
          </Box>
          <Box flexGrow={0}>
            <IconButton
              aria-label={t(
                'prepare_scan_modal.content_volumes.delete_replacement_source_aria'
              )}
              disabled={index === 0}
              onClick={() => handleRemove(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Button variant="outlined" onClick={handleAppend}>
        {t('prepare_scan_modal.content_volumes.add_replacement_source_button')}
      </Button>
    </>
  )
}

export default ReplacementSourcesSelection
