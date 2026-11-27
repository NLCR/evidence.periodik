import Box from '@mui/material/Box'
import { type FC } from 'react'

type Props = {
  monthFrom: number
  monthTo: number
  color: string
}

const months = Array.from({ length: 12 }, (_, index) => index + 1)

const VolumeMonthBar: FC<Props> = ({ monthFrom, monthTo, color }) => (
  <Box
    aria-hidden="true"
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      columnGap: '1px',
      height: 5,
      bgcolor: 'common.white',
      borderBottomLeftRadius: 'inherit',
      borderBottomRightRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
  >
    {months.map((month) => (
      <Box
        key={month}
        sx={{
          bgcolor: month >= monthFrom && month <= monthTo ? color : 'grey.200',
        }}
      />
    ))}
  </Box>
)

export default VolumeMonthBar
