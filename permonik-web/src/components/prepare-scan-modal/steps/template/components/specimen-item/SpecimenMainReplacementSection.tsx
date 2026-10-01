import Box from '@mui/material/Box'
import { Checkbox, FormControlLabel, Stack } from '@mui/material'
import { Controller, type Control, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  createEmptyReplacementSource,
  ResolutionStatus,
  type TMainReplacement,
  type TReplacementSource,
  type TTemplate,
  type TTemplateSpecimen,
} from '@/components/prepare-scan-modal/schemas/schemas'
import ReplacementSourceInput from '../../../common/ReplacementSourceInput'

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
  control: Control<TTemplate>
  itemPath: `items.${number}`
  specimen: TTemplateSpecimen
  disabled: boolean
  isItemLocked: boolean
  mainReplacement: TMainReplacement | null | undefined
  replacementSourceCandidates: TReplacementSource[]
}

const SpecimenMainReplacementSection = ({
  control,
  itemPath,
  specimen,
  disabled,
  isItemLocked,
  mainReplacement,
  replacementSourceCandidates,
}: Props) => {
  const { t } = useTranslation()
  const { setValue } = useFormContext<TTemplate>()
  if (specimen.numExists) return null

  const isReadOnly = disabled || isItemLocked

  return (
    <Box
      mt={1}
      data-validation-path={`${itemPath}.mainScan.replacement.volume`}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Controller
          control={control}
          name={`${itemPath}.mainScan.replacement.volume`}
          render={({ field, fieldState }) => (
            <ReplacementSourceInput
              viewOnly={false}
              value={field.value ?? createEmptyReplacementSource()}
              candidates={replacementSourceCandidates}
              onChange={(source) => {
                field.onChange(source)
                setValue(
                  `${itemPath}.mainScan.replacement.status`,
                  getReplacementSourceResolutionStatus(source),
                  { shouldDirty: true }
                )
              }}
              errorMessage={fieldState.error?.message}
              validationPath={`${itemPath}.mainScan.replacement.volume`}
              disabled={
                isReadOnly ||
                mainReplacement?.status === ResolutionStatus.UNREPLACEABLE ||
                mainReplacement?.status === ResolutionStatus.WAITING_FOR_RESCAN
              }
            />
          )}
        />
      </Stack>
      <Stack direction="row" gap={8}>
        <Controller
          control={control}
          name={`${itemPath}.mainScan.replacement.status`}
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
                          : getReplacementSourceResolutionStatus(
                              mainReplacement?.volume
                            )
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
                          : getReplacementSourceResolutionStatus(
                              mainReplacement?.volume
                            )
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
    </Box>
  )
}

export default SpecimenMainReplacementSection
