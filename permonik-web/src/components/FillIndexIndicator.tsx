import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  clampFillIndex,
  fillIndexGradient,
  getFillIndexColor,
} from '@/utils/fillIndex'

type FillIndexIndicatorProps = {
  value: number
  displayHint?: boolean
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
  const color = getFillIndexColor(value)

  return (
    <Box component="span" display="inline-flex" alignItems="center" gap={1}>
      <Box component="span" sx={{ textBox: 'trim-both cap alphabetic' }}>
        {formatFillIndex(value)}
      </Box>
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
                    background: fillIndexGradient,
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
