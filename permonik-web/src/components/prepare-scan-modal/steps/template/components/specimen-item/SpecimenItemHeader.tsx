import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TFunction } from 'i18next'
import { useFormContext } from 'react-hook-form'
import {
  TTemplate,
  TTemplateSpecimenRef,
} from '@/components/prepare-scan-modal/schemas/schemas'
import { getDateLabel, getNumberLabel } from '../../utils/specimenLabels'
import { applyItemLock } from '../../utils/templateItemLocking'
import IconCheckbox from '@/components/form/IconCheckbox'

type Props = {
  specimen: TTemplateSpecimenRef
  t: TFunction
  itemPath: `items.${number}`
  canManageLocks: boolean
}

const SpecimenItemHeader = ({
  specimen,
  t,
  itemPath,
  canManageLocks,
}: Props) => {
  const { getValues, setValue } = useFormContext<TTemplate>()

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 140 }}>
              {getNumberLabel(specimen, t)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              (
              {specimen.publicationDate
                ? getDateLabel(specimen.publicationDate)
                : '-'}
              )
            </Typography>
          </Stack>
          <IconCheckbox
            name={`${itemPath}.locked`}
            IconFalse={<LockOpenIcon />}
            IconTrue={<LockIcon />}
            disabled={!canManageLocks}
            afterChange={(value) => {
              const currentItem = getValues(itemPath)
              setValue(itemPath, applyItemLock(currentItem, value), {
                shouldDirty: true,
              })
            }}
          />
        </Stack>
      </Stack>

      <Box mt={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          {specimen.numExists ? (
            <CheckIcon color="success" fontSize="small" />
          ) : (
            <WarningIcon color="error" fontSize="small" />
          )}
          <Typography>
            {specimen.numExists
              ? t('prepare_scan_modal.content_template.scan_from_volume')
              : t('prepare_scan_modal.content_template.replace_label')}
          </Typography>
        </Stack>
      </Box>
    </>
  )
}

export default SpecimenItemHeader
