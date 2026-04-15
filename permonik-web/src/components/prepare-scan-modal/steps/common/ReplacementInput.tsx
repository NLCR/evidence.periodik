import DeleteIcon from '@mui/icons-material/Delete'
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import FormCheckbox from '../../../form/FormCheckbox'
import { TReplacementSource, TTemplate } from '../../schemas/schemas'
import ReplacementSourceInput from '../common/ReplacementSourceInput'

type Props = {
  name:
    | `items.${number}.replacement`
    | `items.${number}.pageReplacements.${number}`
  viewOnly: boolean
  includePageSelect?: boolean
  index: number
  replacementSourceCandidates: TReplacementSource[]
  onRemove: (index: number) => void
  disabled?: boolean
}

const ReplacementInput = ({
  name,
  viewOnly,
  includePageSelect = false,
  index,
  replacementSourceCandidates,
  onRemove,
  disabled = false,
}: Props) => {
  const { control } = useFormContext<TTemplate>()

  const item = useWatch({ control, name })
  return (
    <>
      <Stack direction="row" alignItems="center" gap={1}>
        {includePageSelect && (
          <Controller
            control={control}
            name={`${name}.pages`}
            render={({ field }) =>
              viewOnly ? (
                <Typography>{field.value?.toString()}</Typography>
              ) : (
                <TextField
                  label="Strany"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={
                    disabled ||
                    item?.isUnreplaceable ||
                    item?.isWaitingForRescan
                  }
                />
              )
            }
          />
        )}
        <Controller
          control={control}
          name={`${name}.volume`}
          render={({ field, fieldState }) => (
            <ReplacementSourceInput
              viewOnly={viewOnly}
              value={field.value}
              candidates={replacementSourceCandidates}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={
                disabled || item?.isUnreplaceable || item?.isWaitingForRescan
              }
            />
          )}
        />
        <IconButton onClick={() => onRemove(index)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      <Stack direction={'row'} gap={8} paddingLeft={4}>
        <Box>
          <FormCheckbox<TTemplate>
            name={`${name}.isUnreplaceable` as const}
            label="Náhrada není dostupná"
            disabled={disabled || item?.isWaitingForRescan}
          />
        </Box>
        <Box>
          <FormCheckbox<TTemplate>
            name={`${name}.isWaitingForRescan` as const}
            label="Čeká na dosken"
            disabled={disabled || item?.isUnreplaceable}
          />
        </Box>
      </Stack>
    </>
  )
}
export default ReplacementInput
