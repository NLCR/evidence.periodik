import { useFormContext } from 'react-hook-form'
import { TScanTemplateSettings } from '../../schemas'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import FillIndexIndicator from '../../../FillIndexIndicator'
import ReplacementSourcesSelection from './ReplacementSourcesSelection'

const PrepareScanModalContentVolumes = () => {
  const { register } = useFormContext<TScanTemplateSettings>()

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
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                disabled
                {...register('replacementSourcesParameters.metatitle')}
              />
            }
            label="Metatitul"
          />
          <FormControlLabel
            control={
              <Checkbox
                disabled
                {...register('replacementSourcesParameters.timeOverlap')}
              />
            }
            label="Překryv časového rozpětí"
          />
          <FormControlLabel
            control={
              <Checkbox
                {...register('replacementSourcesParameters.mutation')}
              />
            }
            label="Mutace"
          />
          <FormControlLabel
            control={
              <Checkbox
                {...register('replacementSourcesParameters.mutationalEdition')}
              />
            }
            label="Mutační vydání"
          />
          <FormControlLabel
            control={
              <Checkbox {...register('replacementSourcesParameters.owner')} />
            }
            label="Vlastník"
          />
        </Stack>
      </Box>

      <Box gap={1} display={'flex'} flexDirection={'column'}>
        <Typography variant="h6">Zdroje náhrad</Typography>
        <ReplacementSourcesSelection />
      </Box>
    </Box>
  )
}

export default PrepareScanModalContentVolumes
