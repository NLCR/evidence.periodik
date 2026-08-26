import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createEmptyReplacementSource,
  ResolutionStatus,
  type TReplacementSource,
  type TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'
import IconCheckbox from '@/components/form/IconCheckbox'
import { isLockingEnabled } from '../template/utils/templateItemLocking'
import { formatPages, parsePages } from './pages'
import ReplacementSourceInput from './ReplacementSourceInput'

const hasReplacementSource = (source: TReplacementSource | undefined) =>
  !!(
    source?.volumeId ||
    source?.signature?.trim() ||
    source?.owner?.trim() ||
    source?.barcode?.trim() ||
    source?.mutation?.trim() ||
    source?.mutationEdition?.trim()
  )

const getReplacementSourceResolutionStatus = (
  source: TReplacementSource | undefined
) =>
  hasReplacementSource(source)
    ? ResolutionStatus.ASSIGNED
    : ResolutionStatus.UNRESOLVED

type Props = {
  name: `items.${number}.pageReplacements.${number}`
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
  const { clearErrors, control, setError, setValue } =
    useFormContext<TTemplate>()
  const item = useWatch({ control, name })
  const [pagesText, setPagesText] = useState(() =>
    formatPages(item?.pages ?? [])
  )
  const templateState = useWatch({ control, name: 'state' })
  const isReadOnly = viewOnly || disabled || item?.locked

  return (
    <>
      <Stack direction="row" alignItems="center" gap={1}>
        {includePageSelect && (
          <Controller
            control={control}
            name={`${name}.pages`}
            render={({ field, fieldState }) =>
              viewOnly ? (
                <Typography>{formatPages(field.value)}</Typography>
              ) : (
                <TextField
                  label={t('prepare_scan_modal.content_template.pages_label')}
                  value={pagesText}
                  onChange={(event) => {
                    setPagesText(event.target.value)
                    const pages = parsePages(event.target.value)
                    if (!pages) {
                      setError(`${name}.pages`, {
                        type: 'validate',
                        message: t(
                          'prepare_scan_modal.validation.invalid_pages'
                        ),
                      })
                      return
                    }
                    clearErrors(`${name}.pages`)
                    field.onChange(pages)
                  }}
                  onBlur={() => {
                    field.onBlur()
                    setPagesText(formatPages(field.value))
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={isReadOnly}
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
              value={field.value ?? createEmptyReplacementSource()}
              candidates={replacementSourceCandidates}
              onChange={(source) => {
                field.onChange(source)
                setValue(
                  `${name}.status`,
                  getReplacementSourceResolutionStatus(source),
                  { shouldDirty: true }
                )
              }}
              errorMessage={fieldState.error?.message}
              disabled={
                isReadOnly ||
                item?.status === ResolutionStatus.UNREPLACEABLE ||
                item?.status === ResolutionStatus.WAITING_FOR_RESCAN
              }
            />
          )}
        />
        <IconCheckbox
          IconTrue={<LockIcon />}
          IconFalse={<LockOpenIcon />}
          name={`${name}.locked`}
          disabled={!isLockingEnabled(templateState) || disabled}
        />
        <IconButton onClick={() => onRemove(index)} disabled={isReadOnly}>
          <DeleteIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" gap={8} paddingLeft={4}>
        <Controller
          control={control}
          name={`${name}.status`}
          render={({ field }) => (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value === ResolutionStatus.UNREPLACEABLE}
                    disabled={
                      isReadOnly ||
                      field.value === ResolutionStatus.WAITING_FOR_RESCAN
                    }
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                          ? ResolutionStatus.UNREPLACEABLE
                          : getReplacementSourceResolutionStatus(item?.volume)
                      )
                    }
                  />
                }
                label={t(
                  'prepare_scan_modal.content_template.replacement_unavailable'
                )}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      field.value === ResolutionStatus.WAITING_FOR_RESCAN
                    }
                    disabled={
                      isReadOnly ||
                      field.value === ResolutionStatus.UNREPLACEABLE
                    }
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                          ? ResolutionStatus.WAITING_FOR_RESCAN
                          : getReplacementSourceResolutionStatus(item?.volume)
                      )
                    }
                  />
                }
                label={t(
                  'prepare_scan_modal.content_template.waiting_for_rescan_label'
                )}
              />
            </>
          )}
        />
      </Stack>
    </>
  )
}

export default ReplacementInput
