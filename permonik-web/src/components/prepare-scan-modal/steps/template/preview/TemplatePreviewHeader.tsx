import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getTemplateStateIcon,
  getTemplateStateLabel,
  type TemplateState,
} from '@/components/prepare-scan-modal/schemas/templateStateSchema'
import {
  type TTemplateItem,
  type TTemplateVolume,
} from '@/components/prepare-scan-modal/schemas/templateSchema'

export type TTemplatePreviewHeaderProps = {
  primaryVolume: TTemplateVolume
  items: TTemplateItem[]
  displayCurrentState?: boolean
  currentState?: TemplateState
}

const TemplatePreviewHeader: FC<TTemplatePreviewHeaderProps> = ({
  primaryVolume,
  items,
  displayCurrentState = false,
  currentState = undefined,
}) => {
  const { t } = useTranslation()

  const title = primaryVolume.metaTitleName
  const signature = primaryVolume.signature
  const subTitle = primaryVolume.subName
  const owner = primaryVolume.ownerName
  const mutation = primaryVolume.mutationName
  const mutationEdition = primaryVolume.mutationMark?.mark ?? undefined
  const dateFrom = primaryVolume.dateFrom
    ? new Date(primaryVolume.dateFrom).toLocaleDateString()
    : '-'
  const dateTo = primaryVolume.dateTo
    ? new Date(primaryVolume.dateTo).toLocaleDateString()
    : '-'
  const specimensCount = items.filter(
    (item) => !item.specimen.attachmentNumber
  ).length
  const attachmentsCount = items.filter(
    (item) => !!item.specimen.attachmentNumber
  ).length

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {`${title} (${t('common.fields.signature').toLowerCase()} ${signature ?? t('prepare_scan_modal.content_template.unknown_signature').toLowerCase()})`}
        </Typography>
        {displayCurrentState && currentState && (
          <Chip
            icon={getTemplateStateIcon(currentState)}
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
          {t('common.fields.owner')}: {owner ?? '-'}
        </Typography>
        <Typography>
          {t('common.fields.mutation')}: {mutation ?? '-'}
        </Typography>
        <Typography>
          {t('common.fields.mutation_mark')}: {mutationEdition ?? '-'}
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
