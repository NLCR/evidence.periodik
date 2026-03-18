import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Loader from '../../../Loader'
import ShowError from '../../../ShowError'
import ReplacementInput from '../common/ReplacementInput'
import {
  emptyReplacement,
  TReplacement,
  TReplacementSource,
  TScanTemplateSettings,
} from '../../schemas'
import { useReplacementSourceCandidatesQuery } from '../../../../api/replacementSourceCandidates'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

const createEmptyReplacementSource = (): TReplacementSource => {
  const { pages, ...replacementSource } = emptyReplacement
  void pages

  return replacementSource
}

const ReplacementSourcesSelection = () => {
  const { control, watch } = useFormContext<TScanTemplateSettings>()
  const issues = watch('issues')
  const replacementSourcesParameters = watch('replacementSourcesParameters')
  const { fields, append, remove } = useFieldArray({
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

  if (replacementSourceCandidatesLoading) return <Loader size="small" />
  if (replacementSourceCandidatesError) return <ShowError />

  return (
    <>
      {fields.map((field, index) => (
        <Box key={field.fieldId} display={'flex'} gap={1} alignItems={'center'}>
          {index + 1}:{' '}
          <Controller
            control={control}
            name={`replacementSources.${index}`}
            render={({ field: fieldProps }) => (
              <ReplacementInput
                allPages
                value={{ ...fieldProps.value, pages: emptyReplacement.pages }}
                candidates={replacementSourceCandidates?.filter(
                  (candidate) =>
                    !fields.some(
                      (src, srcIndex) =>
                        src.id === candidate.id && srcIndex !== index
                    )
                )}
                onChange={(value: TReplacement) => {
                  const { pages, ...replacementSource } = value
                  void pages

                  fieldProps.onChange(replacementSource)
                }}
              />
            )}
          />
          <IconButton
            aria-label="Smazat zdroj náhrady"
            disabled={index === 0}
            onClick={() => remove(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        onClick={() => append(createEmptyReplacementSource())}
      >
        Přidat zdroj náhrad
      </Button>
    </>
  )
}

export default ReplacementSourcesSelection
