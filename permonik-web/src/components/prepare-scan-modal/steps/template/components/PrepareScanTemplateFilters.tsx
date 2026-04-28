import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type TProps = {
  showOnlyRescans: boolean
  showOnlyUnlocked: boolean
  onShowOnlyRescansChange: (checked: boolean) => void
  onShowOnlyUnlockedChange: (checked: boolean) => void
}

const PrepareScanTemplateFilters: FC<TProps> = ({
  showOnlyRescans,
  showOnlyUnlocked,
  onShowOnlyRescansChange,
  onShowOnlyUnlockedChange,
}) => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={1}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyRescans}
            onChange={(_, checked) => onShowOnlyRescansChange(checked)}
          />
        }
        label={t('prepare_scan_modal.content_template.show_only_rescans')}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyUnlocked}
            onChange={(_, checked) => onShowOnlyUnlockedChange(checked)}
          />
        }
        label={t('prepare_scan_modal.content_template.show_only_unlocked')}
      />
    </Stack>
  )
}

export default PrepareScanTemplateFilters
