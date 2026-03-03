import React, { Dispatch, SetStateAction } from 'react'
import { emptyReplacement, TScanTemplateSettings } from '../schemas'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import ReplacementInput from '../ReplacementInput'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
}

const PrepareScanModalContentVolumes = ({
  templateSettings,
  setTemplateSettings,
}: Props) => {
  return (
    <Box gap={2} display={'flex'} flexDirection={'column'}>
      <Typography>
        Index vyplněnosti primárního svazku: 86 381{' '}
        <div
          style={{
            borderRadius: 10,
            backgroundColor: 'orange',
            width: 10,
            height: 10,
            display: 'inline-block',
          }}
        />
      </Typography>
      <Typography>
        Index vyplněnosti výsledného svazku: 98 633{' '}
        <div
          style={{
            borderRadius: 10,
            backgroundColor: 'green',
            width: 10,
            height: 10,
            display: 'inline-block',
          }}
        />
      </Typography>
      <Box>
        <Typography variant="h6">
          V náhradních svazcích je nutné zachovat:
        </Typography>
        <Box>
          <Checkbox disabled checked={true} value={true} defaultChecked />{' '}
          Metatitul
        </Box>
        <Box>
          <Checkbox disabled checked={true} value={true} defaultChecked />{' '}
          Překryv časového rozpětí
        </Box>
        <Box>
          <Checkbox /> Mutace
        </Box>
        <Box>
          <Checkbox /> Mutační vydání
        </Box>
        <Box>
          <Checkbox /> Vlastník
        </Box>
      </Box>

      <Box gap={1} display={'flex'} flexDirection={'column'}>
        <Typography variant="h6">Zdroje náhrad</Typography>
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
                emptyReplacement,
              ],
            }))
          }
        >
          Přidat zdroj náhrad
        </Button>
      </Box>
    </Box>
  )
}

export default PrepareScanModalContentVolumes
