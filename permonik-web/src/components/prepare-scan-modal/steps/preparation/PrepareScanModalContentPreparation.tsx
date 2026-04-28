import { useTranslation } from 'react-i18next'

import { Box, Typography, Stack } from '@mui/material'
undefined

const PrepareScanModalContentPreparation = () => {
  const { t } = useTranslation()

  return (
    <Box p={2}>
      <Typography variant="h6" paddingBottom={2}>
        {t('prepare_scan_modal.content_preparation.title')}
      </Typography>

      <Stack>
        <FormCheckbox
          disabled
          name="issues.missingSpecimen"
          label={t('prepare_scan_modal.content_preparation.missing_number')}
        />

        <FormCheckbox
          disabled
          name="issues.missingPages"
          label={t('prepare_scan_modal.content_preparation.missing_pages')}
        />

        <FormCheckbox
          name="issues.censored"
          label={t('prepare_scan_modal.content_preparation.censored')}
        />

        <FormCheckbox
          name="issues.degradation"
          label={t('prepare_scan_modal.content_preparation.degradation')}
        />

        <FormCheckbox
          name="issues.illegiblyBound"
          label={t('prepare_scan_modal.content_preparation.illegibly_bound')}
        />

        <FormCheckbox
          name="issues.damagedPages"
          label={t('prepare_scan_modal.content_preparation.damaged_pages')}
        />
      </Stack>
    </Box>
  )
}

export default PrepareScanModalContentPreparation
