import React, { Dispatch, SetStateAction } from 'react'
import { TScanTemplateSettings, TTemplateIssues } from '../schemas'
import { useTranslation } from 'react-i18next'

import {
  Box,
  Checkbox,
  Typography,
  Stack,
  FormControlLabel,
} from '@mui/material'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
}

const PrepareScanModalContentPreparation = ({
  templateSettings,
  setTemplateSettings,
}: Props) => {
  const { t } = useTranslation()

  const safeSetTemplateSettings = (settingsPart: Partial<TTemplateIssues>) => {
    setTemplateSettings((prev) => ({
      ...prev,
      issues: { ...prev.issues, ...settingsPart },
    }))
  }

  const issues = templateSettings.issues

  return (
    <Box p={2}>
      <Typography variant="h6" paddingBottom={2}>
        {t('prepare_scan_modal.content_preparation.title')}
      </Typography>

      <Stack>
        <FormControlLabel
          control={
            <Checkbox
              disabled
              checked={issues.missingSpecimen}
              onChange={(e) =>
                safeSetTemplateSettings({
                  missingSpecimen: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.missing_number')}
        />

        <FormControlLabel
          control={
            <Checkbox
              disabled
              checked={issues.missingPages}
              onChange={(e) =>
                safeSetTemplateSettings({
                  missingPages: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.missing_pages')}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={issues.censored ?? false}
              onChange={(e) =>
                safeSetTemplateSettings({
                  censored: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.censored')}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={issues.degradation ?? false}
              onChange={(e) =>
                safeSetTemplateSettings({
                  degradation: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.degradation')}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={issues.illegiblyBound ?? false}
              onChange={(e) =>
                safeSetTemplateSettings({
                  illegiblyBound: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.illegibly_bound')}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={issues.damagedPages ?? false}
              onChange={(e) =>
                safeSetTemplateSettings({
                  damagedPages: e.target.checked,
                })
              }
            />
          }
          label={t('prepare_scan_modal.content_preparation.damaged_pages')}
        />
      </Stack>
    </Box>
  )
}

export default PrepareScanModalContentPreparation
