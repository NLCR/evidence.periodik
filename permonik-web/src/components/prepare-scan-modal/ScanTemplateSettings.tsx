import React, { Dispatch, SetStateAction } from 'react'
import {
  defaultReplacement,
  TReplacementSource,
  TScanTemplateSettings,
} from './schemas'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import ReplacementInput from './ReplacementInput'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
  onConfirm: () => void
}

const ScanTemplateSettings = ({
  templateSettings,
  setTemplateSettings,
  onConfirm,
}: Props) => {
  return (
    <Box gap={2} display={'flex'} flexDirection={'column'}>
      <Box>
        <Typography variant="h6">Doplnit náhradu za:</Typography>
        <Box>
          <Checkbox /> Chybějící strany
        </Box>
        <Box>
          <Checkbox /> Poškozené strany
        </Box>
        <Box>
          <Checkbox /> Špatná vazba
        </Box>
      </Box>
      <Box gap={1} display={'flex'} flexDirection={'column'}>
        <Typography variant="h6">Zdroje náhrad:</Typography>
        {templateSettings.replacementSources.map((item, index) => (
          <Box key={index} display={'flex'} gap={1} alignItems={'center'}>
            {index + 1}:{' '}
            <ReplacementInput
              allPages
              value={{ ...item, pages: '' }}
              onChange={(value) =>
                setTemplateSettings((prev) => ({
                  ...prev,
                  replacementSources: prev.replacementSources.map((x, i) =>
                    i === index ? value : x
                  ),
                }))
              }
            />
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={() =>
            setTemplateSettings((prev) => ({
              ...prev,
              replacementSources: [
                ...prev.replacementSources,
                defaultReplacement,
              ],
            }))
          }
        >
          Přidat zdroj náhrad
        </Button>
      </Box>
      <Button variant="contained" onClick={onConfirm}>
        Potvrdit
      </Button>
    </Box>
  )
}

export default ScanTemplateSettings
