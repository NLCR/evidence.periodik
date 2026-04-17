import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Loader from '../../../Loader'
import ShowError from '../../../ShowError'
import { useReplacementSourceCandidatesQuery } from '../../../../api/replacementSourceCandidates'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import {
  EMPTY_REPLACEMENT_SOURCE,
  TReplacementSource,
  TScanTemplateSettings,
} from '../../schemas/schemas'
import ReplacementSourceInput from '../common/ReplacementSourceInput'
import { useTranslation } from 'react-i18next'

const ReplacementSourcesSelection = () => {
  const { t } = useTranslation()
  const { control, watch } = useFormContext<TScanTemplateSettings>()

  const issues = watch('issues')
  const replacementSourcesParameters = watch('replacementSourcesParameters')
  const replacementSources = watch('replacementSources')
  const { fields, append, replace } = useFieldArray({
    control,
    name: 'replacementSources',
    keyName: 'fieldId',
  })

  const {
    data: replacementSourceCandidates,
    isLoading: replacementSourceCandidatesLoading,
    isError: replacementSourceCandidatesError,
  } = useReplacementSourceCandidatesQuery({
    issues,
    replacementSourcesParameters,
  })

  const buildReplacementSource = (priority: number): TReplacementSource => ({
    ...EMPTY_REPLACEMENT_SOURCE,
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

  if (replacementSourceCandidatesLoading) return <Loader size="small" />
  if (replacementSourceCandidatesError) return <ShowError />

  return (
    <>
      {fields.map((field, index) => (
        <Box key={field.fieldId} display={'flex'} gap={1} alignItems={'center'}>
          <Box flexGrow={0}>{index + 1}: </Box>
          <Box flexGrow={1}>
            <Controller
              control={control}
              name={`replacementSources.${index}`}
              render={({ field: fieldProps }) => (
                <ReplacementSourceInput
                  value={fieldProps.value}
                  candidates={replacementSourceCandidates?.filter(
                    (candidate) =>
                      !fields.some(
                        (src, srcIndex) =>
                          src.id === candidate.id && srcIndex !== index
                      )
                  )}
                  onChange={fieldProps.onChange}
                />
              )}
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
