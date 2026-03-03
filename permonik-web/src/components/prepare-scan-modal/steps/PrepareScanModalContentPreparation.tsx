import React, { Dispatch, SetStateAction } from 'react'
import { TScanTemplateSettings, TTemplateIssues } from '../schemas'

import {
  Box,
  Checkbox,
  Button,
  Typography,
  Stack,
  FormControlLabel,
  Divider,
} from '@mui/material'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
}

const PrepareScanModalContentPreparation = ({
  templateSettings,
  setTemplateSettings,
}: Props) => {
  const safeSetTemplateSettings = (settingsPart: Partial<TTemplateIssues>) => {
    setTemplateSettings((prev) => ({
      ...prev,
      issues: { ...prev.issues, ...settingsPart },
    }))
  }

  const issues = templateSettings.issues

  return (
    <Box p={2}>
      <Typography variant="h6" paddingBottom={3}>
        Doplnit náhradu za:
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
          label="Chybějící číslo"
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
          label="Chybějící strany"
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
          label="Cenzurování"
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
          label="Degradace papíru"
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
          label="Nečitelné svázání"
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
          label="Poškozené strany"
        />
      </Stack>
    </Box>
  )
}

export default PrepareScanModalContentPreparation
