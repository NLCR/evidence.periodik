import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  TTemplate,
  TTemplateSpecimenRef,
} from '@/components/prepare-scan-modal/schemas/schemas'
import { getDateLabel, getNumberLabel } from '../../utils/specimenLabels'
import {
  applyItemLock,
  areAllScanTasksLocked,
} from '../../utils/templateItemLocking'
import ActionsMenu from '../../../../../ActionsMenu'

type Props = {
  specimen: TTemplateSpecimenRef
  itemPath: `items.${number}`
  canManageLocks: boolean
}

const SpecimenItemHeader = ({ specimen, itemPath, canManageLocks }: Props) => {
  const { t } = useTranslation()
  const { control, getValues, setValue } = useFormContext<TTemplate>()
  const item = useWatch({ control, name: itemPath })

  const setMainScanLock = (locked: boolean) => {
    const currentItem = getValues(itemPath)
    const updatedItem = {
      ...currentItem,
      mainScan: { ...currentItem.mainScan, locked, visible: !locked },
    }

    setValue(itemPath, updatedItem, { shouldDirty: true })
  }

  const setItemLock = (locked: boolean) => {
    const currentItem = getValues(itemPath)

    setValue(itemPath, applyItemLock(currentItem, locked), {
      shouldDirty: true,
    })
  }

  const allScanTasksLocked = item ? areAllScanTasksLocked(item) : false
  const hasLockedScanTasks = item
    ? item.mainScan.locked ||
      item.pageReplacements.some((replacement) => replacement.locked)
    : false

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox
              name={`${itemPath}.mainScan.locked`}
              icon={<LockOpenIcon />}
              checkedIcon={<LockIcon />}
              checked={item ? item.mainScan.locked : false}
              disabled={!canManageLocks}
              onChange={(_, value) => setMainScanLock(value)}
            />
            <ActionsMenu
              actions={[
                {
                  label: t('prepare_scan_modal.content_template.lock_item'),
                  disabled: allScanTasksLocked,
                  onClick: () => setItemLock(true),
                },
                {
                  label: t('prepare_scan_modal.content_template.unlock_item'),
                  disabled: !hasLockedScanTasks,
                  onClick: () => setItemLock(false),
                },
              ]}
            />
          </Stack>
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
