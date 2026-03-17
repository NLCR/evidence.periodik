import React, { Dispatch, SetStateAction } from 'react'
import { TScanTemplateSettings } from '../schemas'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FillIndexIndicator from '../../FillIndexIndicator'
import ReplacementSourcesSelection from './ReplacementSourcesSelection'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
}

const PrepareScanModalContentVolumes = ({
  templateSettings,
  setTemplateSettings,
}: Props) => {
  const safeSetReplacementSourcesParameters = (
    settingsPart: Partial<TScanTemplateSettings['replacementSourcesParameters']>
  ) => {
    setTemplateSettings((prev) => ({
      ...prev,
      replacementSourcesParameters: {
        ...prev.replacementSourcesParameters,
        ...settingsPart,
      },
    }))
  }

  const replacementSourcesParameters =
    templateSettings.replacementSourcesParameters

  return (
    <Box gap={2} display={'flex'} flexDirection={'column'}>
      <Typography>
        Index vyplněnosti primárního svazku:{' '}
        <FillIndexIndicator value={86381} displayHint />
      </Typography>
      <Typography>
        Index vyplněnosti výsledného svazku:{' '}
        <FillIndexIndicator value={98633} displayHint />
      </Typography>
      <Box>
        <Typography variant="h6">
          V náhradních svazcích je nutné zachovat:
        </Typography>
        <Box>
          <Checkbox
            disabled
            checked={replacementSourcesParameters.metatitle}
            onChange={(e) =>
              safeSetReplacementSourcesParameters({
                metatitle: e.target.checked,
              })
            }
          />{' '}
          Metatitul
        </Box>
        <Box>
          <Checkbox
            disabled
            checked={replacementSourcesParameters.timeOverlap}
            onChange={(e) =>
              safeSetReplacementSourcesParameters({
                timeOverlap: e.target.checked,
              })
            }
          />{' '}
          Překryv časového rozpětí
        </Box>
        <Box>
          <Checkbox
            checked={replacementSourcesParameters.mutation}
            onChange={(e) =>
              safeSetReplacementSourcesParameters({
                mutation: e.target.checked,
              })
            }
          />{' '}
          Mutace
        </Box>
        <Box>
          <Checkbox
            checked={replacementSourcesParameters.mutationalEdition}
            onChange={(e) =>
              safeSetReplacementSourcesParameters({
                mutationalEdition: e.target.checked,
              })
            }
          />{' '}
          Mutační vydání
        </Box>
        <Box>
          <Checkbox
            checked={replacementSourcesParameters.owner}
            onChange={(e) =>
              safeSetReplacementSourcesParameters({
                owner: e.target.checked,
              })
            }
          />{' '}
          Vlastník
        </Box>
      </Box>

      <Box gap={1} display={'flex'} flexDirection={'column'}>
        <Typography variant="h6">Zdroje náhrad</Typography>
        <ReplacementSourcesSelection
          templateSettings={templateSettings}
          setTemplateSettings={setTemplateSettings}
        />
      </Box>
    </Box>
  )
}

export default PrepareScanModalContentVolumes
