import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Controller, type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  createEmptyReplacementSource,
  type TMainReplacement,
  type TReplacementSource,
  type TTemplate,
  type TTemplateSpecimenRef,
} from '@/components/prepare-scan-modal/schemas/schemas'
import FormCheckbox from '../../../../../form/FormCheckbox'
import ReplacementSourceInput from '../../../common/ReplacementSourceInput'

type Props = {
  control: Control<TTemplate>
  itemPath: `items.${number}`
  specimen: TTemplateSpecimenRef
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

  if (specimen.numExists) return null

  return (
    <Box mt={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Controller
          control={control}
          name={`${itemPath}.mainScan.replacement.volume`}
          render={({ field, fieldState }) => (
            <ReplacementSourceInput
              viewOnly={false}
              value={field.value ?? createEmptyReplacementSource()}
              candidates={replacementSourceCandidates}
              onChange={field.onChange}
              errorMessage={fieldState.error?.message}
              disabled={
                disabled ||
                isItemLocked ||
                mainReplacement?.isUnreplaceable ||
                mainReplacement?.isWaitingForRescan
              }
            />
          )}
        />
      </Stack>
      <Stack direction="row" gap={8}>
        <Box>
          <FormCheckbox<TTemplate>
            name={`${itemPath}.mainScan.replacement.isUnreplaceable` as const}
            label={t(
              'prepare_scan_modal.content_template.replacement_unavailable'
            )}
            disabled={
              disabled || isItemLocked || mainReplacement?.isWaitingForRescan
            }
          />
        </Box>
        <Box>
          <FormCheckbox<TTemplate>
            name={
              `${itemPath}.mainScan.replacement.isWaitingForRescan` as const
            }
            label={t(
              'prepare_scan_modal.content_template.waiting_for_rescan_label'
            )}
            disabled={
              disabled || isItemLocked || mainReplacement?.isUnreplaceable
            }
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default SpecimenMainReplacementSection
