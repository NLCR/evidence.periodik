import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { useCalculatedFillIndexQuery } from '../../../../api/volumeCalculatedFillIndex'
import { TScanTemplateSettings } from '../../schemas'
import FillIndexIndicator from '../../../FillIndexIndicator'
import FormCheckbox from '../../../form/FormCheckbox'
import ReplacementSourcesSelection from './ReplacementSourcesSelection'

type Props = {
  volumeId: string
}

const PrepareScanModalContentVolumes = ({ volumeId }: Props) => {
  const { t } = useTranslation()
  const { watch } = useFormContext<TScanTemplateSettings>()

  const primaryVolumeFillIndex = watch('primaryVolumeFillIndex')
  const issues = watch('issues')
  const replacementSources = watch('replacementSources')

  const { data: calculatedFillIndex } = useCalculatedFillIndexQuery(volumeId, {
    issues,
    replacementSourcesIds: replacementSources
      .filter((src) => !!src.id)
      .map((src) => src.id!),
  })

  return (
    <Box gap={2} display={'flex'} flexDirection={'column'}>
      <Typography>
        {t('prepare_scan_modal.content_volumes.primary_fill_index')}{' '}
        <FillIndexIndicator value={primaryVolumeFillIndex} displayHint />
      </Typography>
      <Typography>
        {t('prepare_scan_modal.content_volumes.result_fill_index')}{' '}
        <FillIndexIndicator
          value={calculatedFillIndex ?? primaryVolumeFillIndex}
          displayHint
        />
      </Typography>
      <Box>
        <Typography variant="h6">
          {t('prepare_scan_modal.content_volumes.keep_title')}
        </Typography>
        <Stack>
          <FormCheckbox
            disabled
            name="replacementSourcesParameters.metatitle"
            label={t('prepare_scan_modal.content_volumes.metatitle')}
          />
          <FormCheckbox
            disabled
            name="replacementSourcesParameters.timeOverlap"
            label={t('prepare_scan_modal.content_volumes.time_overlap')}
          />
          <FormCheckbox
            name="replacementSourcesParameters.mutation"
            label={t('prepare_scan_modal.content_volumes.mutation')}
          />
          <FormCheckbox
            name="replacementSourcesParameters.mutationalEdition"
            label={t('prepare_scan_modal.content_volumes.mutational_edition')}
          />
          <FormCheckbox
            name="replacementSourcesParameters.owner"
            label={t('prepare_scan_modal.content_volumes.owner')}
          />
        </Stack>
      </Box>

      <Box gap={1} display={'flex'} flexDirection={'column'}>
        <Typography variant="h6">
          {t('prepare_scan_modal.content_volumes.replacement_sources_title')}
        </Typography>
        <ReplacementSourcesSelection />
      </Box>
    </Box>
  )
}

export default PrepareScanModalContentVolumes
