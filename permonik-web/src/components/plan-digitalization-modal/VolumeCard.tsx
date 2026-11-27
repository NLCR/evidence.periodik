import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { getFillIndexColor } from '@/utils/fillIndex'
import FillIndexIndicator from '../FillIndexIndicator'
import VolumeMonthBar from './VolumeMonthBar'
import { type PlanDigitalizationResponse } from './schemas'

type Props = {
  volume: PlanDigitalizationResponse[number]['libraries'][number]['volumes'][number]
  selected: boolean
  onSelectionChange: (checked: boolean) => void
}

const VolumeCard: FC<Props> = ({ volume, selected, onSelectionChange }) => {
  const { t, i18n } = useTranslation()
  const { monthFrom, monthTo } = volume
  const monthRange = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    month: 'short',
    timeZone: 'UTC',
  }).formatRange(Date.UTC(2000, monthFrom - 1), Date.UTC(2000, monthTo - 1))

  return (
    <Paper variant="outlined" sx={{ position: 'relative' }}>
      <Stack sx={{ px: 1, py: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" gap={1}>
          <Link
            component={RouterLink}
            to={`/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${volume.id}`}
            variant="body2"
            fontWeight={700}
            underline="hover"
            aria-label={t('plan_digitalization_modal.open_volume', {
              barcode: volume.barCode,
            })}
            sx={{
              overflowWrap: 'anywhere',
              // Extend the link over the card without nesting other controls in it.
              '&::after': { content: '""', position: 'absolute', inset: 0 },
            }}
          >
            {volume.barCode}
          </Link>
          <Typography
            variant="caption"
            color="text.secondary"
            whiteSpace="nowrap"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
          >
            {volume.continuesFromPreviousYear && (
              <ArrowBackIcon
                fontSize="inherit"
                titleAccess={t(
                  'plan_digitalization_modal.continues_from_previous_year'
                )}
              />
            )}
            {monthRange}
            {volume.continuesIntoNextYear && (
              <ArrowForwardIcon
                fontSize="inherit"
                titleAccess={t(
                  'plan_digitalization_modal.continues_into_next_year'
                )}
              />
            )}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          sx={{ '& button': { position: 'relative', zIndex: 1 } }}
        >
          <FillIndexIndicator value={volume.fillIndex} displayHint />
          <Stack direction="row" alignItems="center" gap={0.25}>
            <Checkbox
              size="small"
              checked={selected}
              onChange={(event) => onSelectionChange(event.target.checked)}
              sx={{
                position: 'relative',
                zIndex: 1,
                p: 0,
                minWidth: 24,
                minHeight: 24,
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              whiteSpace="nowrap"
            >
              {t('plan_digitalization_modal.page_count', {
                count: volume.pagesCount,
              })}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <VolumeMonthBar
        monthFrom={monthFrom}
        monthTo={monthTo}
        color={getFillIndexColor(volume.fillIndex)}
      />
    </Paper>
  )
}

export default VolumeCard
