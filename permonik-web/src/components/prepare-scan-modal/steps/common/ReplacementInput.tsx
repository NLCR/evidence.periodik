import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormCheckbox from '../../../form/FormCheckbox'
import {
  TReplacementSource,
  TemplateState,
  TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'
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
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<TTemplate>()

  const item = useWatch({ control, name })
  const templateState = useWatch({ control, name: 'state' })

  const isLockingAllowed =
    templateState === TemplateState.CREATED ||
    templateState === TemplateState.WAITING_FOR_RESCAN ||
    templateState === TemplateState.LATE_FIXES
  const isLocked = !!item?.locked
  const isReadOnly = disabled || isLocked

  const handleToggleLock = () => {
    setValue(`${name}.locked`, !isLocked, { shouldDirty: true })
  }

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
                  label={t('prepare_scan_modal.content_template.pages_label')}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={
                    isReadOnly ||
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
                isReadOnly || item?.isUnreplaceable || item?.isWaitingForRescan
              }
            />
          )}
        />
        <IconButton
          onClick={handleToggleLock}
          color={isLocked ? 'primary' : 'default'}
          disabled={!isLockingAllowed || disabled}
        >
          {isLocked ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
        <IconButton onClick={() => onRemove(index)} disabled={isReadOnly}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      <Stack direction={'row'} gap={8} paddingLeft={4}>
        <Box>
          <FormCheckbox<TTemplate>
            name={`${name}.isUnreplaceable` as const}
            label={t(
              'prepare_scan_modal.content_template.replacement_unavailable'
            )}
            disabled={isReadOnly || item?.isWaitingForRescan}
          />
        </Box>
        <Box>
          <FormCheckbox<TTemplate>
            name={`${name}.isWaitingForRescan` as const}
            label={t(
              'prepare_scan_modal.content_template.waiting_for_rescan_label'
            )}
            disabled={isReadOnly || item?.isUnreplaceable}
          />
        </Box>
      </Stack>
    </>
  )
}
export default ReplacementInput
