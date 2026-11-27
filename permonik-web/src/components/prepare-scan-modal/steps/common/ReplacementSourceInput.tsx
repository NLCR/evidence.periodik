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
import { type TFunction } from 'i18next'
import { useOwnerListQuery } from '@/api/owner'
import {
  createEmptyReplacementSource,
  type TReplacementSource,
} from '@/components/prepare-scan-modal/schemas/schemas'
import FillIndexIndicator from '@/components/FillIndexIndicator'
import ReplacementSourceInputComponent from './ReplacementSourceInputComponent'
import ManualReplacementSourceInput from './ManualReplacementSourceInput'

type Props = {
  viewOnly?: boolean
  showReplacementOrderLabel?: boolean
  value: TReplacementSource
  onChange: (value: TReplacementSource) => void
  candidates?: TReplacementSource[]
  errorMessage?: string
  disabled?: boolean
  validationPath?: string
  alignWithPageSelect?: boolean
}

const hasReplacementSource = (source: TReplacementSource) =>
  !!(
    source.volumeId ||
    source.signature?.trim() ||
    source.owner?.trim() ||
    source.barcode?.trim() ||
    source.mutation?.trim() ||
    source.mutationEdition?.trim()
  )

const matchesReplacementSource = (
  candidate: TReplacementSource,
  source: TReplacementSource
) => {
  if (candidate.volumeId || source.volumeId) {
    return !!candidate.volumeId && candidate.volumeId === source.volumeId
  }

  return (
    hasReplacementSource(source) &&
    (candidate.signature ?? '') === (source.signature ?? '') &&
    (candidate.owner ?? '') === (source.owner ?? '') &&
    (candidate.barcode ?? '') === (source.barcode ?? '') &&
    (candidate.mutation ?? '') === (source.mutation ?? '') &&
    (candidate.mutationEdition ?? '') === (source.mutationEdition ?? '')
  )
}

const buildReplacementOptionLabel = (
  option: TReplacementSource,
  index: number,
  showReplacementOrderLabel: boolean,
  t: TFunction<'global'>,
  ownerLabel: string | null | undefined
): ReactNode => (
  <>
    {showReplacementOrderLabel && (
      <>
        <strong>
          {t('prepare_scan_modal.content_template.replacement_section_title', {
            index: index + 1,
          })}
        </strong>
        {' - '}
      </>
    )}
    {option.signature} - {ownerLabel} ({option.barcode})
  </>
)

const ReplacementSourceInput = ({
  viewOnly = false,
  showReplacementOrderLabel = false,
  value,
  onChange,
  candidates: candidates = [],
  errorMessage = undefined,
  disabled = false,
  validationPath = undefined,
  alignWithPageSelect = false,
}: Props) => {
  const { t } = useTranslation()
  const { data: owners } = useOwnerListQuery()
  const selectedCandidateIndex = candidates.findIndex((candidate) =>
    matchesReplacementSource(candidate, value)
  )
  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>(() =>
    !value.volumeId && hasReplacementSource(value) && selectedCandidateIndex < 0
      ? 'MANUAL'
      : 'SELECT'
  )
  const selectId = useId()
  const safeSetReplacement = (nextPartial: Partial<TReplacementSource>) => {
    onChange({
      ...value,
      ...nextPartial,
    })
  }

  const handleSelectChange = (selectedIndex: string) => {
    const selectedOption = candidates[Number(selectedIndex)]
    if (!selectedOption) return

    onChange({
      ...selectedOption,
      priority: value.priority,
    })
  }

  return (
    <Box
      width="100%"
      flexGrow={1}
      minWidth={0}
      data-validation-path={validationPath}
    >
      <Stack
        direction="row"
        gap={1}
        width={'100%'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        {viewOnly || mode === 'MANUAL' ? (
          <Box
            gap={1}
            width={'100%'}
            flexGrow={1}
            mt={alignWithPageSelect ? 2 : 0}
            minWidth={0}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(5, minmax(0, 1fr))',
              },
              alignItems: 'start',
            }}
          >
            {!viewOnly ? (
              <ManualReplacementSourceInput
                value={value}
                onChange={onChange}
                disabled={disabled}
              />
            ) : (
              <>
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
                  value={
                    owners?.find((owner) => owner.sigla === value.owner)
                      ?.shorthand ?? value.owner
                  }
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
                  onChange={(next) =>
                    safeSetReplacement({ mutationEdition: next })
                  }
                  fullWidth
                  disabled={disabled}
                />
              </>
            )}
          </Box>
        ) : (
          <>
            <FormControl
              fullWidth
              error={!!errorMessage}
              sx={alignWithPageSelect ? { mt: 2 } : undefined}
            >
              <InputLabel id={`${selectId}-label`}>
                {t(
                  'prepare_scan_modal.content_template.select_replacement_volume'
                )}
              </InputLabel>
              <Select
                fullWidth
                labelId={`${selectId}-label`}
                id={selectId}
                value={
                  selectedCandidateIndex < 0
                    ? ''
                    : String(selectedCandidateIndex)
                }
                label={t(
                  'prepare_scan_modal.content_template.select_replacement_volume'
                )}
                onChange={(event) =>
                  handleSelectChange(String(event.target.value))
                }
                disabled={disabled}
              >
                {candidates.map((option, index) =>
                  hasReplacementSource(option) ? (
                    <MenuItem key={index} value={String(index)}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Box>
                          {buildReplacementOptionLabel(
                            option,
                            index,
                            showReplacementOrderLabel,
                            t,
                            owners?.find(
                              (owner) => owner.sigla === option.owner
                            )?.shorthand ?? option.owner
                          )}
                        </Box>
                        {option.dependentFillIndex != null && (
                          <FillIndexIndicator
                            value={option.dependentFillIndex}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ) : null
                )}
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
