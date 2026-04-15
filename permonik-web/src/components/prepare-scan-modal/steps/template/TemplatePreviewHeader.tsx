import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getTemplateStateIcon,
  getTemplateStateLabel,
  TemplateState,
} from '../../schemas/templateStateSchema'

export type TTemplatePreviewHeaderProps = {
  title: string
  signature?: string
  subTitle?: string
  owner?: string
  mutation?: string
  mutationEdition?: string
  dateFrom?: string
  dateTo?: string
  specimensCount: number
  attachmentsCount: number
  displayCurrentState?: boolean
  currentState?: TemplateState
}

const TemplatePreviewHeader: FC<TTemplatePreviewHeaderProps> = ({
  title,
  signature = undefined,
  subTitle = undefined,
  owner = undefined,
  mutation = undefined,
  mutationEdition = undefined,
  dateFrom = undefined,
  dateTo = undefined,
  specimensCount,
  attachmentsCount,
  displayCurrentState = false,
  currentState = undefined,
}) => {
  const { t } = useTranslation()
  const StateIconComponent = currentState
    ? getTemplateStateIcon(currentState)
    : undefined

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {`${title} (${t('prepare_scan_modal.content_template.signature_label').toLowerCase()} ${signature ?? t('prepare_scan_modal.content_template.unknown_signature').toLowerCase()})`}
        </Typography>
        {displayCurrentState && currentState && (
          <Chip
            icon={
              StateIconComponent ? (
                <StateIconComponent fontSize="small" />
              ) : undefined
            }
            label={getTemplateStateLabel(currentState)}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              px: 0.5,
              bgcolor: 'primary.50',
              borderColor: 'primary.200',
            }}
          />
        )}
      </Stack>
      <Box display="grid" gridTemplateColumns="1fr 1fr">
        <Typography>
          {t('prepare_scan_modal.content_template.header_subtitle')}:{' '}
          {subTitle ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.volume_owner')}:{' '}
          {owner ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.volume_mutation')}:{' '}
          {mutation ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.volume_mutation_edition')}:{' '}
          {mutationEdition ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.header_range_from')}:{' '}
          {dateFrom ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.header_range_to')}:{' '}
          {dateTo ?? '-'}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.header_specimens_count')}:{' '}
          {specimensCount}
        </Typography>
        <Typography>
          {t('prepare_scan_modal.content_template.header_attachments_count')}:{' '}
          {attachmentsCount}
        </Typography>
      </Box>
    </>
  )
}

export default TemplatePreviewHeader
