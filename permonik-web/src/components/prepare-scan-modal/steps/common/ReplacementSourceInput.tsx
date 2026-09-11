import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { type ReactNode, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createEmptyReplacementSource,
  type TReplacementSource,
} from '@/components/prepare-scan-modal/schemas/schemas'
import FillIndexIndicator from '@/components/FillIndexIndicator'
import ReplacementSourceInputComponent from './ReplacementSourceInputComponent'

type Props = {
  viewOnly?: boolean
  value: TReplacementSource
  onChange: (value: TReplacementSource) => void
  candidates?: TReplacementSource[]
  errorMessage?: string
  disabled?: boolean
}

const ReplacementSourceInput = ({
  viewOnly = false,
  value,
  onChange,
  candidates: candidates = [],
  errorMessage = undefined,
  disabled = false,
}: Props) => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>('SELECT')
  const selectId = useId()

  const safeSetReplacement = (nextPartial: Partial<TReplacementSource>) => {
    onChange({
      ...value,
      ...nextPartial,
    })
  }

  const handleSelectChange = (selectedId: string) => {
    const selectedOption = candidates.find(
      (option) => option.volumeId === selectedId
    )
    if (!selectedOption) return

    onChange({
      ...selectedOption,
      priority: value.priority,
    })
  }

  const buildReplacementOptionLabel = (option: TReplacementSource): ReactNode =>
    `${option.signature} - ${option.owner} (${option.barcode})`

  return (
    <Box width="100%">
      <Stack
        direction="row"
        gap={1}
        width={'100%'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        {viewOnly || mode === 'MANUAL' ? (
          <Box
            display={'flex'}
            flexDirection={'row'}
            gap={1}
            alignItems={'center'}
            width={'100%'}
            flexGrow={1}
            justifyContent={'space-between'}
          >
            <ReplacementSourceInputComponent
              label={t('common.fields.signature')}
              viewOnly={viewOnly}
              value={value.signature}
              onChange={(next) => safeSetReplacement({ signature: next })}
              fullWidth
              disabled={disabled}
            />
            <ReplacementSourceInputComponent
              label={t('common.fields.owner')}
              viewOnly={viewOnly}
              value={value.owner}
              onChange={(next) => safeSetReplacement({ owner: next })}
              fullWidth
              disabled={disabled}
            />
            <ReplacementSourceInputComponent
              label={t(
                'prepare_scan_modal.content_template.replacement_barcode'
              )}
              viewOnly={viewOnly}
              value={value.barcode}
              onChange={(next) => safeSetReplacement({ barcode: next })}
              fullWidth
              disabled={disabled}
            />
            <ReplacementSourceInputComponent
              label={t('common.fields.mutation')}
              viewOnly={viewOnly}
              value={value.mutation}
              onChange={(next) => safeSetReplacement({ mutation: next })}
              fullWidth
              disabled={disabled}
            />
            <ReplacementSourceInputComponent
              label={t('common.fields.mutation_mark')}
              viewOnly={viewOnly}
              value={value.mutationEdition}
              onChange={(next) => safeSetReplacement({ mutationEdition: next })}
              fullWidth
              disabled={disabled}
            />
          </Box>
        ) : (
          <>
            <FormControl fullWidth error={!!errorMessage}>
              <InputLabel id={`${selectId}-label`}>
                {t(
                  'prepare_scan_modal.content_template.select_replacement_volume'
                )}
              </InputLabel>
              <Select
                fullWidth
                labelId={`${selectId}-label`}
                id={selectId}
                value={value.volumeId ?? ''}
                label={t(
                  'prepare_scan_modal.content_template.select_replacement_volume'
                )}
                onChange={(event) =>
                  handleSelectChange(String(event.target.value))
                }
                disabled={disabled}
              >
                {candidates
                  .filter((option) => !!option.volumeId)
                  .map((option) => (
                    <MenuItem key={option.volumeId} value={option.volumeId!}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Box>{buildReplacementOptionLabel(option)}</Box>
                        {option.dependentFillIndex != null && (
                          <FillIndexIndicator
                            value={option.dependentFillIndex}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </>
        )}
        {!viewOnly && (
          <Box flexGrow={0}>
            <IconButton
              disabled={disabled}
              onClick={() => {
                setMode(mode === 'MANUAL' ? 'SELECT' : 'MANUAL')
                onChange({
                  ...createEmptyReplacementSource(),
                  priority: value.priority,
                })
              }}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Box>
        )}
      </Stack>
      {errorMessage && !viewOnly ? (
        <FormHelperText error>{errorMessage}</FormHelperText>
      ) : null}
    </Box>
  )
}

export default ReplacementSourceInput
