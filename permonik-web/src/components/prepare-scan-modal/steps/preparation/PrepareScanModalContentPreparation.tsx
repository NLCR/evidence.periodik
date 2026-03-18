import { useFormContext } from 'react-hook-form'
import { TScanTemplateSettings } from '../../schemas'
import { useTranslation } from 'react-i18next'

import {
  Box,
  Checkbox,
  Typography,
  Stack,
  FormControlLabel,
} from '@mui/material'

const PrepareScanModalContentPreparation = () => {
  const { t } = useTranslation()
  const { register } = useFormContext<TScanTemplateSettings>()

  return (
    <Box p={2}>
      <Typography variant="h6" paddingBottom={2}>
        {t('prepare_scan_modal.content_preparation.title')}
      </Typography>

      <Stack>
        <FormControlLabel
          control={
            <Checkbox disabled {...register('issues.missingSpecimen')} />
          }
          label={t('prepare_scan_modal.content_preparation.missing_number')}
        />

        <FormControlLabel
          control={<Checkbox disabled {...register('issues.missingPages')} />}
          label={t('prepare_scan_modal.content_preparation.missing_pages')}
        />

        <FormControlLabel
          control={<Checkbox {...register('issues.censored')} />}
          label={t('prepare_scan_modal.content_preparation.censored')}
        />

        <FormControlLabel
          control={<Checkbox {...register('issues.degradation')} />}
          label={t('prepare_scan_modal.content_preparation.degradation')}
        />

        <FormControlLabel
          control={<Checkbox {...register('issues.illegiblyBound')} />}
          label={t('prepare_scan_modal.content_preparation.illegibly_bound')}
        />

        <FormControlLabel
          control={<Checkbox {...register('issues.damagedPages')} />}
          label={t('prepare_scan_modal.content_preparation.damaged_pages')}
        />
      </Stack>
    </Box>
  )
}

export default PrepareScanModalContentPreparation
