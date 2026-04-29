import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TFunction } from 'i18next'
import { TTemplateSpecimenRef } from '@/components/prepare-scan-modal/schemas/schemas'
import { getDateLabel, getNumberLabel } from '../../utils/specimenLabels'

type Props = {
  specimen: TTemplateSpecimenRef
  t: TFunction
  isItemLocked: boolean
  canManageLocks: boolean
  onToggleItemLock: () => void
}

const SpecimenItemHeader = ({
  specimen,
  t,
  isItemLocked,
  canManageLocks,
  onToggleItemLock,
}: Props) => (
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
        <IconButton
          onClick={onToggleItemLock}
          color={isItemLocked ? 'primary' : 'default'}
          disabled={!canManageLocks}
          aria-label={
            isItemLocked
              ? t(
                  'prepare_scan_modal.content_template.unlock_all_confirm_title'
                )
              : t('prepare_scan_modal.content_template.lock_all_confirm_title')
          }
        >
          {isItemLocked ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
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

export default SpecimenItemHeader
