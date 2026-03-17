import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type FillIndexIndicatorProps = {
  value: number
  displayHint?: boolean
}

const SCALE_MIN = 50000
const SCALE_MAX = 100000

const DARK_RED = { r: 139, g: 0, b: 0 }
const ORANGE = { r: 255, g: 165, b: 0 }
const BRIGHT_GREEN = { r: 0, g: 200, b: 83 }

const interpolateChannel = (from: number, to: number, ratio: number) =>
  Math.round(from + (to - from) * ratio)

const toRgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`

const clampFillIndex = (value: number) =>
  Math.min(SCALE_MAX, Math.max(0, Math.round(value)))

const getIndicatorColor = (value: number) => {
  const clampedValue = clampFillIndex(value)

  if (clampedValue <= SCALE_MIN) {
    return toRgb(DARK_RED.r, DARK_RED.g, DARK_RED.b)
  }

  if (clampedValue >= SCALE_MAX) {
    return toRgb(BRIGHT_GREEN.r, BRIGHT_GREEN.g, BRIGHT_GREEN.b)
  }

  const midpoint = (SCALE_MIN + SCALE_MAX) / 2

  if (clampedValue <= midpoint) {
    const ratio = (clampedValue - SCALE_MIN) / (midpoint - SCALE_MIN)
    return toRgb(
      interpolateChannel(DARK_RED.r, ORANGE.r, ratio),
      interpolateChannel(DARK_RED.g, ORANGE.g, ratio),
      interpolateChannel(DARK_RED.b, ORANGE.b, ratio)
    )
  }

  const ratio = (clampedValue - midpoint) / (SCALE_MAX - midpoint)
  return toRgb(
    interpolateChannel(ORANGE.r, BRIGHT_GREEN.r, ratio),
    interpolateChannel(ORANGE.g, BRIGHT_GREEN.g, ratio),
    interpolateChannel(ORANGE.b, BRIGHT_GREEN.b, ratio)
  )
}

const formatFillIndex = (value: number) => {
  const safeValue = clampFillIndex(value)
  const leftPart = Math.floor(safeValue / 1000)
  const rightPart = String(safeValue % 1000).padStart(3, '0')

  return `${leftPart}–${rightPart}`
}

const FillIndexIndicator: FC<FillIndexIndicatorProps> = ({
  value,
  displayHint = false,
}) => {
  const { t } = useTranslation()
  const color = getIndicatorColor(value)

  return (
    <Box component="span" display="inline-flex" alignItems="center" gap={1}>
      <Box component="span">{formatFillIndex(value)}</Box>
      <Box
        component="span"
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
      {displayHint && (
        <Tooltip
          arrow
          placement="top"
          title={
            <Box sx={{ maxWidth: 420 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('fill_index_hint.title')}
              </Typography>
              <Typography variant="body2">
                {t('fill_index_hint.format')}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                {t('fill_index_hint.xx')}
              </Typography>
              <Typography variant="body2">
                {t('fill_index_hint.yyy')}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                {t('fill_index_hint.positions')}
              </Typography>
              <Typography variant="body2">
                {t('fill_index_hint.position_1')}
              </Typography>
              <Typography variant="body2">
                {t('fill_index_hint.position_2')}
              </Typography>
              <Typography variant="body2">
                {t('fill_index_hint.position_3')}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                {t('fill_index_hint.example')}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                {t('fill_index_hint.color_scale')}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  marginTop: 0.5,
                }}
              >
                <Box
                  component="div"
                  sx={{
                    width: '100%',
                    height: 10,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${toRgb(
                      DARK_RED.r,
                      DARK_RED.g,
                      DARK_RED.b
                    )} 0%, ${toRgb(ORANGE.r, ORANGE.g, ORANGE.b)} 50%, ${toRgb(
                      BRIGHT_GREEN.r,
                      BRIGHT_GREEN.g,
                      BRIGHT_GREEN.b
                    )} 100%)`,
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 0.5,
                  }}
                >
                  <Typography variant="caption">
                    {t('fill_index_hint.color_low')}
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'right' }}>
                    {t('fill_index_hint.color_high')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          }
        >
          <IconButton
            aria-label={t('fill_index_hint.aria_label')}
            size="small"
            sx={{ width: 28, height: 28 }}
          >
            <HelpOutlineIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default FillIndexIndicator
